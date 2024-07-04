# pt-string

A single line portable text input.

![Screenshot](./assets/screenshot-dark.png#gh-dark-mode-only)
![Screenshot](./assets/screenshot-light.png#gh-light-mode-only)

> This is a **Sanity Studio v3** plugin.

## Installation

```sh
npm install sanity-plugin-pt-string
```

## Usage

Add it as a plugin in `sanity.config.ts` (or .js):

```ts
import {defineConfig} from 'sanity'
import {ptString} from 'sanity-plugin-pt-string'

export default defineConfig({
  //...
  plugins: [ptString()],
})
```

Use in your schema:

```ts
import {defineType} from 'sanity'

export default defineType({
  name: 'myType',
  type: 'document',
  fields: [
    {
      name: 'myField',
      type: 'pt-string',
      title: 'My Field',
    },
  ],
})
```

### Preview

Add a preview config your schema type: `schemaTypes/schema.ts`:

```ts
import {defineType, defineField} from 'sanity'
import {ptStringPreview} from 'sanity-plugin-pt-string'

export default defineType({
  name: 'myType',
  type: 'document',
  fields: [
    defineField({
      name: 'myField',
      type: 'pt-string',
      title: 'My Field',
      preview: ptStringPreview,
    }),
  ],
  preview: ptStringPreview('myField'),
})
```

### Options

Customize decorators by passing an object with the following properties:

```ts
import {defineType} from 'sanity'

export default defineType({
  name: 'myType',
  type: 'document',
  fields: [
    {
      name: 'myField',
      type: 'pt-string',
      title: 'My Field',
      options: {
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
          {title: 'Code', value: 'code'},
          {title: 'Underline', value: 'underline'},
          {title: 'Strike', value: 'strike-through'},
        ],
      },
    },
  ],
})
```

Add your own custom decorators:

```ts
import { defineType } from 'sanity';
import { HighlightIcon } from '@sanity/icons';

const HighlightDecorator = (props) => <span style={{ backgroundColor: '#ff0', color: '#000' }}>{props.children}</span>;

export default defineType({
  name: 'myType',
  type: 'document',
  fields: [
    {
      name: 'myField',
      type: 'pt-string',
      title: 'My Field',
      options: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Code', value: 'code' },
          { title: 'Underline', value: 'underline' },
          { title: 'Strike', value: 'strike-through' },
          // Custom highlight decorator
          {
            title: 'Highlight',
            value: 'highlight',
            icon: HighlightIcon,
            component: HighlightDecorator,
          },
        ],
      },
    },
  ],
});
```

## Migrations

See the migration script inside ./migrations/transformStringToPortableText.js of this Repo.

Follow the instructions inside the script and set the \_type and field name you wish to target.

Please take a backup first!

## License

[MIT](LICENSE) © Rostislav Melkumyan

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.
