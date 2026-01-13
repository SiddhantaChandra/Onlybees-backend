const BASE_URL = 'http://localhost:3000'
const EVENT_ID =  99
const SECTION_ID = 100
const REQUESTS = 10
const QTY = 5

async function postBook(body) {
  const res = await fetch(`${BASE_URL}/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  let json
  try {
    json = text ? JSON.parse(text) : null
  } catch (e) {
    json = { parseError: e.message, raw: text }
  }
  return { status: res.status, data: json }
}

async function getEvent(eventId) {
  const res = await fetch(`${BASE_URL}/events/${eventId}`)
  const data = await res.json()
  return { status: res.status, data }
}

async function main() {
  console.log(`Running concurrency test against ${BASE_URL}`)
  console.log(`eventId=${EVENT_ID}, sectionId=${SECTION_ID}, requests=${REQUESTS}, qty=${QTY}`)

  const requests = Array.from({ length: REQUESTS }).map(() =>
    postBook({ eventId: EVENT_ID, sectionId: SECTION_ID, qty: QTY })
  )

  const results = await Promise.all(requests)
  const successes = results.filter((r) => r.status === 201)
  const failures = results.filter((r) => r.status !== 201)

  console.log('--- Results ---')
  console.log(`Successes: ${successes.length}`)
  console.log(`Failures:  ${failures.length}`)
  if (failures.length) {
    console.log('Failure samples (first 3):')
    failures.slice(0, 3).forEach((f, i) => {
      console.log(` ${i + 1}) status=${f.status} body=${JSON.stringify(f.data)}`)
    })
  }

  const eventRes = await getEvent(EVENT_ID)
  if (eventRes.status === 200) {
    const section = (eventRes.data.sections || []).find((s) => s.id === SECTION_ID)
    if (section) {
      const capacity = section.capacity
      const remaining = section.remaining
      const totalBooked = successes.length * QTY
      console.log('--- Post-test state ---')
      console.log(`Capacity:  ${capacity}`)
      console.log(`Remaining: ${remaining}`)
      console.log(`Total booked by this run (successes * qty): ${totalBooked}`)
      if (remaining < 0 || totalBooked > capacity) {
        console.log('Oversell detected')
      } else {
        console.log('No oversell')
      }
    } else {
      console.log('Could not find section in event response')
    }
  } else {
    console.log(`Could not fetch event. Status: ${eventRes.status}`)
  }
}

main().catch((err) => {
  console.error('Test failed', err)
  process.exit(1)
})
