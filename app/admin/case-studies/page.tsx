import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAllCaseStudies } from '@/lib/content'
import { format } from 'date-fns'

export default async function CaseStudiesManagement() {
  const studies = await getAllCaseStudies()

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Case Studies</h1>
          <p className="text-muted-foreground mt-2">Manage your case studies</p>
        </div>
        <Button disabled>Create New Case Study (Coming Soon)</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Published Case Studies</CardTitle>
          <CardDescription>{studies.length} total case studies</CardDescription>
        </CardHeader>
        <CardContent>
          {studies.length === 0 ? (
            <p className="text-muted-foreground">No case studies found.</p>
          ) : (
            <div className="space-y-4">
              {studies.map((study) => (
                <div
                  key={study.slug}
                  className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{study.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>Client:</strong> {study.clientName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Problem:</strong> {study.problem}
                    </p>
                    <div className="flex gap-2 mt-3">
                      {study.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Published: {format(new Date(study.publishedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link href={`/case-studies/${study.slug}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" disabled>
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

