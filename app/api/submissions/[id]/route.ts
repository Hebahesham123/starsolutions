import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'submissions.json')

function readSubmissions() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function writeSubmissions(data: unknown[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { status, notes } = body
    const id = params.id

    const submissions = readSubmissions()
    const idx = submissions.findIndex((s: { id: string }) => s.id === id)
    if (idx === -1) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (status !== undefined) submissions[idx].status = status
    if (notes !== undefined) submissions[idx].notes = notes
    submissions[idx].lastUpdated = new Date().toISOString()

    writeSubmissions(submissions)
    return NextResponse.json(submissions[idx])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const submissions = readSubmissions()
    const submission = submissions.find((s: { id: string }) => s.id === params.id)
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }
    return NextResponse.json(submission)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch submission' }, { status: 500 })
  }
}
