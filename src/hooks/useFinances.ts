// hooks/useFinances.ts
import { useState, useEffect, useCallback } from 'react'

import type { Transaction } from '../types'
import { supabase } from '../lib/supabaseclient'

export function useFinances() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Transformer les données de la base vers le format frontend
  const transformTransaction = (data: any): Transaction => {
    return {
      id: data.id,
      date: data.date,
      type: data.type === 'revenu' ? 'recette' : 'depense',
      category: data.categorie,
      amount: data.montant,
      description: data.description || '',
      paymentMethod: data.mode_payement || 'especes',
      memberId: '',
      reference: data.referance || ''
    }
  }

  // Transformer les données du frontend vers le format base
  const transformToDB = (transaction: Omit<Transaction, 'id'>) => {
    return {
      type: transaction.type === 'recette' ? 'revenu' : 'depense',
      date: transaction.date,
      categorie: transaction.category,
      montant: transaction.amount,
      description: transaction.description,
      mode_payement: transaction.paymentMethod,
      referance: transaction.reference
    }
  }

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('finances')
        .select('*')
        .order('date', { ascending: false })
      
      if (error) throw error
      setTransactions((data || []).map(transformTransaction))
      setError(null)
    } catch (err: any) {
      console.error('Error loading transactions:', err)
      setError(err.message || 'Erreur lors du chargement des transactions')
    } finally {
      setLoading(false)
    }
  }, [])

  const addTransaction = useCallback(async (transaction: Transaction) => {
    try {
      const { id, ...newTx } = transaction
      const dbTransaction = transformToDB(newTx)
      
      const { data, error } = await supabase
        .from('finances')
        .insert([dbTransaction])
        .select()
        .single()
      
      if (error) throw error
      
      const created = transformTransaction(data)
      setTransactions(prev => [created, ...prev])
      return created
    } catch (err: any) {
      console.error('Error adding transaction:', err)
      setError(err.message)
      throw err
    }
  }, [])

  const updateTransaction = useCallback(async (transaction: Transaction) => {
    try {
      const { id, ...updateTx } = transaction
      const dbTransaction = transformToDB(updateTx)
      
      const { data, error } = await supabase
        .from('finances')
        .update({ ...dbTransaction, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      const updated = transformTransaction(data)
      setTransactions(prev => prev.map(t => t.id === id ? updated : t))
      return updated
    } catch (err: any) {
      console.error('Error updating transaction:', err)
      setError(err.message)
      throw err
    }
  }, [])

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('finances')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setTransactions(prev => prev.filter(t => t.id !== id))
    } catch (err: any) {
      console.error('Error deleting transaction:', err)
      setError(err.message)
      throw err
    }
  }, [])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refresh: loadTransactions
  }
}