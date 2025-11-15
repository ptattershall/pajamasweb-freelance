/**
 * JSON-LD Script Component
 * Renders JSON-LD structured data in the document head
 */

interface JsonLdScriptProps {
  schema: Record<string, any>
}

export function JsonLdScript({ schema }: JsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  )
}

/**
 * Multiple JSON-LD Scripts Component
 * Renders multiple JSON-LD schemas
 */
interface MultipleJsonLdScriptsProps {
  schemas: Record<string, any>[]
}

export function MultipleJsonLdScripts({ schemas }: MultipleJsonLdScriptsProps) {
  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}
    </>
  )
}

