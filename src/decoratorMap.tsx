import styled from 'styled-components'
import {BlockDecoratorRenderProps} from '@portabletext/editor'

const Strong = styled.strong`
  font-weight: 700 !important;
`

const Code = styled.code`
  mix-blend-mode: ${(props) => (props.theme.sanity.color.dark ? 'screen' : 'multiply')};
  color: inherit;
  background: var(--card-code-bg-color);
`

export const decoratorMap: Map<string, (props: BlockDecoratorRenderProps) => JSX.Element> = new Map(
  [
    ['strong', (props) => <Strong>{props.children}</Strong>],
    ['em', (props) => <em>{props.children}</em>],
    ['code', (props) => <Code>{props.children}</Code>],
    ['underline', (props) => <span style={{textDecoration: 'underline'}}>{props.children}</span>],
    [
      'strike-through',
      (props) => <span style={{textDecorationLine: 'line-through'}}>{props.children}</span>,
    ],
  ],
)
