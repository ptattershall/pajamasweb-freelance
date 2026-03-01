'use client'

import dynamic from 'next/dynamic'
import { forwardRef } from 'react'
import { type MDXEditorMethods, type MDXEditorProps } from '@mdxeditor/editor'

const Editor = dynamic(() => import('./InitializedMDXEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] border rounded-lg bg-muted/30 animate-pulse flex items-center justify-center">
      <span className="text-muted-foreground">Loading editor...</span>
    </div>
  ),
})

export const ForwardRefEditor = forwardRef<MDXEditorMethods, MDXEditorProps>(
  (props, ref) => <Editor {...props} editorRef={ref} />
)

ForwardRefEditor.displayName = 'ForwardRefEditor'
