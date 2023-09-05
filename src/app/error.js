'use client'
 
import Link from 'next/link'

/* change for locale */

export default async function Error({
  error,
}) {

// tailwind
// just use router back home
  return (
    <main className="relative min-h-screen w-full block">
        <h2 className="relative text-2xl mx-auto my-5 font-bold text-center">Something went wrong!</h2>
        <div className="relative w-[500px] mx-auto my-5 p-5 bg-white min-h-[200px] rounded">
          <p className="relative w-full">{error.message}</p>
        </div>
        <div className="relative w-full mx-auto my-5">
        <div className="relative w-40 text-white p-2 mx-auto rounded bg-purple-300 flex flex-nowrap justify-center">
          <Link href="/">
          Home
          </Link>
          </div>
        </div>
    </main>
  )
}