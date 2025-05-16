import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Layout from '@/components/layout/layout'
import Home from '@/pages/home/home'
import Test from '@/pages/test/test'
import './App.css'

function App() {

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Default route */}
        <Route path='/' element={<Home />} />

        {/* Test Route */}
        <Route path='/test' element={<Test />} />

        {/* Auth Callback handler */}
        {/* <Route path='/auth/callback' element={<></>} /> */}
      </Route>

      {/* Catch-All -> redirect home */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}

export default App
