import {type ArrayDefinition, defineType} from 'sanity'
import {InputComponent} from './InputComponent'
import {PtStringOptions} from './types'
/**
 * @public
 */
const ptStringTypeName = 'pt-string' as const

/**
 * @public
 */
export interface PtStringDefinition
  extends Omit<ArrayDefinition, 'type' | 'of' | 'options' | 'decorators'> {
  type: typeof ptStringTypeName
  options?: PtStringOptions
}

declare module '@sanity/types' {
  // makes type: 'ptString' narrow correctly when using defineType/defineField/defineArrayMember
  export interface IntrinsicDefinitions {
    ptString: PtStringDefinition
  }
}

/**
 * @public
 */
export const ptStringType = defineType({
  type: 'array',
  name: ptStringTypeName,
  components: {input: InputComponent},
  of: [
    {
      type: 'block',
      marks: {
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
