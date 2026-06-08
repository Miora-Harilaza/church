
import supabase from '../lib/supabaseclient'
import type { Transaction } from '../types'

export const financeService = {
  async getAll(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('finances')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    return (data || []).map(transformTransaction)
  },

  async create(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const dbTransaction = transformToDB(transaction)
    const { data, error } = await supabase
      .from('finances')
      .insert([dbTransaction])
      .select()
      .single()
    
    if (error) throw error
    return transformTransaction(data)
  },

  async update(id: string, transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const dbTransaction = transformToDB(transaction)
    const { data, error } = await supabase
      .from('finances')
      .update({ ...dbTransaction, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return transformTransaction(data)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('finances')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async getStats(startDate?: string, endDate?: string) {
    let query = supabase.from('finances').select('*')
    
    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)
    
    const { data, error } = await query
    if (error) throw error
    
    const transactions = (data || []).map(transformTransaction)
    const totalIncome = transactions.filter(t => t.type === 'recette').reduce((s, t) => s + t.amount, 0)
    const totalExpenses = transactions.filter(t => t.type === 'depense').reduce((s, t) => s + t.amount, 0)
    
    return { transactions, totalIncome, totalExpenses, balance: totalIncome - totalExpenses }
  }
}

// Helpers de transformation
function transformTransaction(data: any): Transaction {
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

function transformToDB(transaction: Omit<Transaction, 'id'>): any {
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