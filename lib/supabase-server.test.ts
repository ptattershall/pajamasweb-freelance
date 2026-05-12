import { describe, expect, it } from 'vitest'
import {
  getSupabaseEnvironmentDiagnostics,
  getSupabaseProjectRefFromUrl,
  inspectSupabaseKey,
} from './supabase-server'

const createLegacySupabaseJwt = (payload: Record<string, unknown>) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')

  return `${header}.${body}.signature`
}

describe('getSupabaseProjectRefFromUrl', () => {
  it('extracts the project ref from a Supabase URL', () => {
    expect(getSupabaseProjectRefFromUrl('https://teomitvsuvfnzxudxlwi.supabase.co')).toBe(
      'teomitvsuvfnzxudxlwi'
    )
  })

  it('returns undefined for invalid URLs', () => {
    expect(getSupabaseProjectRefFromUrl('not-a-valid-url')).toBeUndefined()
  })
})

describe('inspectSupabaseKey', () => {
  it('recognizes legacy JWT keys and exposes the project ref', () => {
    expect(
      inspectSupabaseKey(
        createLegacySupabaseJwt({ ref: 'zynlwtatsulhtczpynwx', role: 'service_role' })
      )
    ).toEqual({
      kind: 'legacy_jwt',
      projectRef: 'zynlwtatsulhtczpynwx',
    })
  })

  it('recognizes new secret keys without trying to infer a project ref', () => {
    expect(inspectSupabaseKey('sb_secret_example')).toEqual({
      kind: 'secret',
    })
  })
})

describe('getSupabaseEnvironmentDiagnostics', () => {
  it('flags server and client key project mismatches for legacy JWT keys', () => {
    const diagnostics = getSupabaseEnvironmentDiagnostics({
      supabaseUrl: 'https://teomitvsuvfnzxudxlwi.supabase.co',
      serviceRoleKey: createLegacySupabaseJwt({
        ref: 'zynlwtatsulhtczpynwx',
        role: 'service_role',
      }),
      publishableKey: createLegacySupabaseJwt({
        ref: 'zynlwtatsulhtczpynwx',
        role: 'anon',
      }),
    })

    expect(diagnostics.warnings).toHaveLength(2)
    expect(diagnostics.warnings[0]).toContain('SUPABASE_SERVICE_ROLE_KEY')
    expect(diagnostics.warnings[1]).toContain('public Supabase key')
  })

  it('does not flag project mismatches for new sb_* keys', () => {
    const diagnostics = getSupabaseEnvironmentDiagnostics({
      supabaseUrl: 'https://teomitvsuvfnzxudxlwi.supabase.co',
      serviceRoleKey: 'sb_secret_example',
      publishableKey: 'sb_publishable_example',
    })

    expect(diagnostics.warnings).toEqual([])
  })
})
