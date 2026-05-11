import React from 'react'
import AvailableStateComponent from './components/AvailableStateComponent'
import Footer from './components/Footer'

export default function AvailableStatePage() {
  return (
    <main className='w-full bg-secondary page grid grid-rows-layout-2 min-h-screen'>
      <AvailableStateComponent />
      <Footer />
    </main>
  )
}
