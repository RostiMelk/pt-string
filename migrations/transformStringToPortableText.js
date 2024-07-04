import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2023-06-30'})

// This example shows how to write a migration script that migrates
// simple string fields to Portable Text arrays

// Transforms fields from:
// "description": "This is a description."

// To:
// "description": [
//   { "_type": "block", "_key": "randomKey1", "style": "normal", "children": [{ "_type": "span", "text": "This is a description." }] }
// ]

// Migrates documents in batches of 100 and continues patching until no more documents are
// returned from the query.

const TYPE = 'presenter' // Modify this to match the document type you are working on
const FIELD_NAME = 'description' // Modify this to match the field you are migrating

const fetchDocuments = () =>
  client.fetch(
    `*[_type == $type && defined(${FIELD_NAME}) && ${FIELD_NAME} match '.*'] [0...100] {
      _id,
      _rev,
      ${FIELD_NAME}
    }`,
    {type: TYPE},
  )

const buildPatches = (docs) =>
  docs.map((doc) => ({
    id: doc._id,
    patch: {
      set: {
        [FIELD_NAME]: [
          {
            _type: 'block',
            _key: `key-${doc._id}`,
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: doc[FIELD_NAME],
              },
            ],
          },
        ],
      },
      ifRevisionID: doc._rev,
    },
  }))

const createTransaction = (patches) =>
  patches.reduce((tx, patch) => tx.patch(patch.id, patch.patch), client.transaction())

const commitTransaction = (tx) => tx.commit()

const migrateNextBatch = async () => {
  const documents = await fetchDocuments()
  const patches = buildPatches(documents)
  if (patches.length === 0) {
    console.log('No more documents to migrate!')
    return null
  }
  console.log(
    `Migrating batch:\n %s`,
    patches.map((patch) => `${patch.id} => ${JSON.stringify(patch.patch)}`).join('\n'),
  )
  const transaction = createTransaction(patches)
  await commitTransaction(transaction)
  return migrateNextBatch()
}

migrateNextBatch().catch((err) => {
  console.error(err)
  throw new Error('Migration failed')
})
