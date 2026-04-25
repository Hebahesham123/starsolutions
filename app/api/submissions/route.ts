import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'submissions.json')

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf-8')
}

function readSubmissions() {
  ensureDataDir()
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function writeSubmissions(data: unknown[]) {
  ensureDataDir()
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, company, message } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const submission = {
      id: Date.now().toString(),
      name,
      email,
      phone: phone || '',
      company: company || '',
      message: message || '',
      timestamp: new Date().toISOString(),
      status: 'new',
      notes: [],
      lastUpdated: new Date().toISOString(),
    }

    const submissions = readSubmissions()
    submissions.unshift(submission) // newest first
    writeSubmissions(submissions)

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('Submission error:', error)
    return NextResponse.json({ error: 'Failed to process submission' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const submissions = readSubmissions()
    return NextResponse.json(submissions)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}
