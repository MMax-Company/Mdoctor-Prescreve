const { createClient } = require('@supabase/supabase-js')

let supabase = null

function getSupabaseClient() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      console.warn('⚠️ Supabase não configurado - usando modo offline')
      return null
    }

    supabase = createClient(url, key)
  }
  return supabase
}

class Database {
  async salvarTriagem(dados) {
    try {
      const client = getSupabaseClient()
      if (!client) return dados

      const { data, error } = await client
        .from('triagens')
        .insert([dados])
        .select()

      if (error) throw error
      return data[0]
    } catch (erro) {
      console.error('Erro ao salvar triagem:', erro.message)
      return dados
    }
  }

  async obterTriagem(id) {
    try {
      const client = getSupabaseClient()
      if (!client) return null

      const { data, error } = await client
        .from('triagens')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (erro) {
      console.error('Erro ao obter triagem:', erro.message)
      return null
    }
  }

  async obterTriagensElegiveis() {
    try {
      const client = getSupabaseClient()
      if (!client) return []

      const { data, error } = await client
        .from('triagens')
        .select('*')
        .eq('elegivel', true)
        .eq('status', 'FILA')
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (erro) {
      console.error('Erro ao obter triagens:', erro.message)
      return []
    }
  }

  async atualizarStatus(triagemId, novoStatus) {
    try {
      const client = getSupabaseClient()
      if (!client) return null

      const { data, error } = await client
        .from('triagens')
        .update({ status: novoStatus, updated_at: new Date().toISOString() })
        .eq('id', triagemId)
        .select()

      if (error) throw error
      return data[0]
    } catch (erro) {
      console.error('Erro ao atualizar status:', erro.message)
      return null
    }
  }

  async salvarProntuario(prontuario) {
    try {
      const client = getSupabaseClient()
      if (!client) return prontuario

      const { data, error } = await client
        .from('prontuarios')
        .insert([prontuario])
        .select()

      if (error) throw error
      return data[0]
    } catch (erro) {
      console.error('Erro ao salvar prontuario:', erro.message)
      return prontuario
    }
  }

  async obterProntuarios(triagemId) {
    try {
      const client = getSupabaseClient()
      if (!client) return []

      const { data, error } = await client
        .from('prontuarios')
        .select('*')
        .eq('triagemId', triagemId)

      if (error) throw error
      return data || []
    } catch (erro) {
      console.error('Erro ao obter prontuarios:', erro.message)
      return []
    }
  }

  async obterReceita(receitaId) {
    try {
      const client = getSupabaseClient()
      if (!client) return null

      const { data, error } = await client
        .from('receitas')
        .select('*')
        .eq('id', receitaId)
        .single()

      if (error) throw error
      return data
    } catch (erro) {
      console.error('Erro ao obter receita:', erro.message)
      return null
    }
  }

  async obterReceitas() {
    try {
      const client = getSupabaseClient()
      if (!client) return []

      const { data, error } = await client
        .from('receitas')
        .select('*')

      if (error) throw error
      return data || []
    } catch (erro) {
      console.error('Erro ao obter receitas:', erro.message)
      return []
    }
  }
}

module.exports = new Database()
