import {
  EditorChange,
  OnPasteResult,
  PasteData,
  PortableTextEditable,
  PortableTextEditor,
  RenderDecoratorFunction,
  RenderPlaceholderFunction,
} from '@portabletext/editor'
import {htmlToBlocks, randomKey} from '@sanity/block-tools'
import {Box, Card, Flex, ThemeProvider, useToast} from '@sanity/ui'
import {useCallback, useState, type ReactNode} from 'react'
import {
  ArrayDefinition,
  BlockDefinition,
  ChangeIndicator,
  PortableTextChild,
  TypedObject,
  type PortableTextBlock,
  type PortableTextInputProps,
  type PortableTextSpan,
} from 'sanity'
import styled from 'styled-components'
import {Toolbar} from './Toolbar'
import {decoratorMap} from './decoratorMap'
import {ptStringType} from './schema'
import {PtStringOptions} from './types'
import {toFormPatches} from './utils'

const EMPTY_ARRAY: [] = []

const InputWrapper = styled(Card)`
  position: relative;
  overflow: hidden;
  font-size: ${(props) => `${props.theme.sanity.fonts.text.sizes[2].fontSize}px`};
  cursor: text;

  &:focus-within {
    box-shadow: 0 0 0 1px var(--card-focus-ring-color);

    div {
      outline: none;
    }
  }

  [role='textbox'] {
    white-space: pre !important;
    overflow-x: auto;
    /* hide scrollbar */
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
`

const Placeholder = styled(Card)`
  color: ${(props) => props.theme.sanity.color.input.default.enabled.placeholder};
`

const optionizedSchemaType = (schemaType: ArrayDefinition, options?: PtStringOptions) => {
  const newSchemaType = {...schemaType}

  if (options?.decorators) {
    const block = newSchemaType.of[0] as BlockDefinition
    if (!block.marks) block.marks = {}
    block.marks.decorators = options.decorators
  }
  return newSchemaType
}

export function InputComponent({
  elementProps,
  value = EMPTY_ARRAY,
  path,
  readOnly,
  changed,
  schemaType,
  onChange,
}: PortableTextInputProps & {schemaType: {options?: PtStringOptions}}): ReactNode {
  const toast = useToast()
  const [isOffline, setIsOffline] = useState(false)
  const [hasFocusWithin, setHasFocusWithin] = useState(false)

  const schema = optionizedSchemaType(ptStringType, schemaType.options)

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
    }
  }, [])

  /**
   * Merge blocks from pasted HTML into a single block
   */
  const handlePaste = useCallback((input: PasteData): OnPasteResult => {
    const {event, schemaTypes, path} = input
    const html = event.clipboardData.getData('text/html')
    if (!html) return {insert: [], path}

    const blocks = htmlToBlocks(html, schemaTypes.portableText) as PortableTextBlock[]

    const mergeToSingleBlock = (
      blocks: PortableTextBlock[],
    ): Array<PortableTextBlock | PortableTextSpan> => {
      let mergedSpans: PortableTextSpan[] = []

      blocks.forEach((block: PortableTextBlock) => {
        if (block._type === 'block' && Array.isArray(block.children)) {
          block.children.forEach((child: PortableTextChild) => {
            if (child._type === 'span') {
              mergedSpans.push({...(child as PortableTextSpan)})
            } else {
              const nestedSpans = mergeToSingleBlock([
                child as PortableTextBlock,
              ]) as PortableTextSpan[]
              mergedSpans = [...mergedSpans, ...nestedSpans]
            }
          })
        }
      })

      // Ensure spaces between spans from different blocks or sub-blocks
      for (let i = 0; i < mergedSpans.length - 1; i++) {
        if (mergedSpans[i].text.endsWith(' ')) continue
        // If the next span has marks, insert a space, otherwise merge the text
        if (mergedSpans[i]?.marks?.length) {
          mergedSpans.splice(i + 1, 0, {
            _key: randomKey(12),
            _type: 'span',
            text: ' ',
          } as PortableTextSpan)
        } else {
          mergedSpans[i].text += ' '
        }
      }

      return new Array({
        _key: randomKey(12),
        _type: 'block',
        children: mergedSpans,
        style: 'normal',
      })
    }

    return {
      insert: mergeToSingleBlock(blocks) as unknown as TypedObject[],
      path,
    }
  }, [])

  const handleEditorChange = useCallback(
    (change: EditorChange) => {
      switch (change.type) {
        case 'mutation':
          onChange(toFormPatches(change.patches))
          break
        case 'connection':
          if (change.value === 'offline') {
            setIsOffline(true)
          } else if (change.value === 'online') {
            setIsOffline(false)
          }
          break
        case 'focus':
          setHasFocusWithin(true)
          elementProps.onFocus(change.event)
          break
        case 'blur':
          setHasFocusWithin(false)
          elementProps.onBlur(change.event)
          break
        case 'undo':
        case 'redo':
          onChange(toFormPatches(change.patches))
          break
        case 'error':
          // Ignore warings
          if (change.level === 'error') {
            toast.push({
              status: change.level,
              description: change.description,
            })
          }
          break
        default:
      }
    },
    [onChange, toast, elementProps],
  )

  const renderPlaceholder: RenderPlaceholderFunction = useCallback(() => {
    return <Placeholder>Empty</Placeholder>
  }, [])

  const renderDecorator: RenderDecoratorFunction = useCallback(
    (props) => {
      const CustomDecoratorComponent = props.schemaType.component
      if (CustomDecoratorComponent) return <CustomDecoratorComponent {...props} />
      return (decoratorMap.get(props.value) ?? ((props) => props.children))(props)
    },
    [schemaType?.options],
  )

  return (
    <ThemeProvider>
      <ChangeIndicator
        path={path}
        isChanged={changed}
        hasFocus={hasFocusWithin}
        readOnly={readOnly}
      >
        <PortableTextEditor
          onChange={handleEditorChange}
          readOnly={isOffline || readOnly}
          schemaType={schema}
          value={value}
        >
          <InputWrapper
            shadow={1}
            paddingY={(schema?.of[0] as BlockDefinition)?.marks?.decorators?.length ? 1 : 2}
            paddingRight={1}
            paddingLeft={3}
            radius={2}
          >
            <Flex gap={1} align="center">
              <Box flex={1} overflow={'auto'} height="fill">
                <PortableTextEditable
                  renderDecorator={renderDecorator}
                  renderPlaceholder={renderPlaceholder}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  {...elementProps}
                />
              </Box>
              <Toolbar />
            </Flex>
          </InputWrapper>
        </PortableTextEditor>
      </ChangeIndicator>
    </ThemeProvider>
  )
}
