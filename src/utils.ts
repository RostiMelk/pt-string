import type {Patch} from '@portabletext/editor'
import {SANITY_PATCH_TYPE} from 'sanity'

export function toFormPatches(patches: any) {
  return patches.map((p: Patch) => ({...p, patchType: SANITY_PATCH_TYPE}))
}
