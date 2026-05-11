"use client";
import React from 'react'
import AvailableForm from './AvailableForm';
import InformationLawyer from './InformationLawyer';

export interface LawyerInfo {
  name: string
  cip: string
  active: boolean
  alive: boolean
  collegiate_status: string
  incorporation_date: string
  condition_message: string
}
export default function AvailableStateComponent() {
  const [lawyerInfo, setLawyerInfo] = React.useState<LawyerInfo | null>(null)
  const handleSetLawyerInfo = (lawyerInfo: LawyerInfo | null) => {
    setLawyerInfo(lawyerInfo)
  }
  return (
    <div className='mx-auto lg:max-w-screen-md xl:max-w-screen-lg 2xl:max-w-screen-xl p-4 md:p-6'>
      <AvailableForm 
        handleSetLawyerInfo={handleSetLawyerInfo}
      />
      <InformationLawyer lawyerInfo={lawyerInfo} />
    </div>
  )
}
