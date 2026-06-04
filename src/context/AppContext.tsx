import { createContext, useContext, useState, ReactNode } from 'react'
import type { Member, Transaction, ChurchEvent, Group, Attendance } from '../types'
import { mockMembers, mockTransactions, mockEvents, mockGroups, mockAttendance } from '../data/mockData'

interface AppContextType {
  members: Member[]
  setMembers: (members: Member[]) => void
  addMember: (member: Member) => void
  updateMember: (member: Member) => void
  deleteMember: (id: string) => void

  transactions: Transaction[]
  addTransaction: (tx: Transaction) => void
  updateTransaction: (tx: Transaction) => void
  deleteTransaction: (id: string) => void

  events: ChurchEvent[]
  addEvent: (event: ChurchEvent) => void
  updateEvent: (event: ChurchEvent) => void
  deleteEvent: (id: string) => void

  groups: Group[]
  addGroup: (group: Group) => void
  updateGroup: (group: Group) => void
  deleteGroup: (id: string) => void

  attendance: Attendance[]
  addAttendance: (att: Attendance) => void

  getMemberById: (id: string) => Member | undefined
  getMemberFullName: (id: string) => string
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>(mockMembers)
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [events, setEvents] = useState<ChurchEvent[]>(mockEvents)
  const [groups, setGroups] = useState<Group[]>(mockGroups)
  const [attendance, setAttendance] = useState<Attendance[]>(mockAttendance)

  const addMember = (member: Member) => setMembers(prev => [...prev, member])
  const updateMember = (member: Member) => setMembers(prev => prev.map(m => m.id === member.id ? member : m))
  const deleteMember = (id: string) => setMembers(prev => prev.filter(m => m.id !== id))

  const addTransaction = (tx: Transaction) => setTransactions(prev => [...prev, tx])
  const updateTransaction = (tx: Transaction) => setTransactions(prev => prev.map(t => t.id === tx.id ? tx : t))
  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id))

  const addEvent = (event: ChurchEvent) => setEvents(prev => [...prev, event])
  const updateEvent = (event: ChurchEvent) => setEvents(prev => prev.map(e => e.id === event.id ? event : e))
  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id))

  const addGroup = (group: Group) => setGroups(prev => [...prev, group])
  const updateGroup = (group: Group) => setGroups(prev => prev.map(g => g.id === group.id ? group : g))
  const deleteGroup = (id: string) => setGroups(prev => prev.filter(g => g.id !== id))

  const addAttendance = (att: Attendance) => setAttendance(prev => [...prev, att])

  const getMemberById = (id: string) => members.find(m => m.id === id)
  const getMemberFullName = (id: string) => {
    const m = members.find(mb => mb.id === id)
    return m ? `${m.firstName} ${m.lastName}` : 'Inconnu'
  }

  return (
    <AppContext.Provider value={{
      members, setMembers, addMember, updateMember, deleteMember,
      transactions, addTransaction, updateTransaction, deleteTransaction,
      events, addEvent, updateEvent, deleteEvent,
      groups, addGroup, updateGroup, deleteGroup,
      attendance, addAttendance,
      getMemberById, getMemberFullName,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
