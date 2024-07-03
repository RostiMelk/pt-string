import {
  EditorSelection,
  PortableTextEditor,
  usePortableTextEditor,
  usePortableTextEditorSelection,
} from '@portabletext/editor'
import {BlockDecoratorDefinition} from '@sanity/types'
import {
  Button,
  Text,
  Flex,
  MenuButton,
  Menu,
  MenuItem,
  useMediaIndex,
  Tooltip,
  TooltipDelayGroupProvider,
} from '@sanity/ui'
import {
  type IconComponent,
  UnderlineIcon,
  StrikethroughIcon,
  CodeIcon,
  ItalicIcon,
  BoldIcon,
  EllipsisVerticalIcon as MenuIcon,
} from '@sanity/icons'
import {useId, useMemo} from 'react'

const iconMap: Record<string, IconComponent> = {
  strong: BoldIcon,
  em: ItalicIcon,
  code: CodeIcon,
  underline: UnderlineIcon,
  'strike-through': StrikethroughIcon,
}

const MOBILE_DECORATOR_LIMIT = 2
const DESKTOP_DECORATOR_LIMIT = 5

export function Toolbar() {
  const editor = usePortableTextEditor()
  const selection = usePortableTextEditorSelection()
  const mediaIndex = useMediaIndex()
  const menuId = useId()

  const isMobile = mediaIndex < 2
  const decorators = editor.schemaTypes.decorators
  const decoratorLimit = isMobile ? MOBILE_DECORATOR_LIMIT : DESKTOP_DECORATOR_LIMIT

  const mainDecorators = useMemo(() => {
    return decorators.slice(0, decoratorLimit)
  }, [isMobile, decorators])
  const overflowDecorators = useMemo(() => {
    return decorators.slice(decoratorLimit)
  }, [isMobile, decorators])
  const showMenuButton = decorators.length > decoratorLimit

  return (
    <Flex gap={1} wrap="wrap">
      <TooltipDelayGroupProvider delay={{open: 400}}>
        {mainDecorators.map((decorator) => (
          <ToolbarButton
            key={decorator.value}
            decorator={decorator}
            editor={editor}
            selection={selection}
          />
        ))}
      </TooltipDelayGroupProvider>

      {showMenuButton && (
        <MenuButton
          id={menuId}
          button={<Button mode="bleed" padding={2} icon={MenuIcon} />}
          menu={
            <Menu>
              {overflowDecorators.map((decorator) => (
                <MenuItem
                  key={decorator.value}
                  text={decorator.title}
                  icon={iconMap[decorator.value]}
                  onClick={() => {
                    PortableTextEditor.toggleMark(editor, decorator.value)
                    PortableTextEditor.focus(editor)
                  }}
                />
              ))}
            </Menu>
          }
        />
      )}
    </Flex>
  )
}

function ToolbarButton(props: {
  decorator: BlockDecoratorDefinition
  editor: PortableTextEditor
  selection: EditorSelection
}) {
  const active =
    props.selection !== null && PortableTextEditor.isMarkActive(props.editor, props.decorator.value)
  const Icon = props.decorator.icon ? props.decorator.icon : iconMap[props.decorator.value]

  return (
    <Tooltip animate content={<Text size={1}>{props.decorator.title}</Text>} placement="top" portal>
      <Button
        mode="bleed"
        padding={2}
        selected={active}
        key={props.decorator.value}
        text={Boolean(Icon) ? undefined : props.decorator.title}
        icon={Icon}
        onClick={() => {
          PortableTextEditor.toggleMark(props.editor, props.decorator.value)
          PortableTextEditor.focus(props.editor)
        }}
      />
    </Tooltip>
  )
}
