const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

class Database {
  async salvarTriagem(dados) {
    try {
      const { data, error } = await supabase
        .from('triagens')
        .insert([dados])
        .select()
      
      if (error) throw error
      return data[0]
    } catch (erro) {
      console.error('❌ Erro ao salvar triagem:', erro.message)
      return null
    }
  }

  async obterTriagensElegiveis() {
    try {
      const { data, error } = await supabase
        .from('triagens')
        .select('*')
        .eq('elegivel', true)
        .eq('status', 'FILA')
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data || []
    } catch (erro) {
      console.error('❌ Erro ao obter triagens:', erro.message)
      return []
    }
  }

  async atualizarStatus(triagemId, novoStatus) {
    try {
      const { data, error } = await supabase
        .from('triagens')
        .update({ status: novoStatus, updated_at: new Date().toISOString() })
        .eq('id', triagemId)
        .select()
      
      if (error) throw error
      return data[0]
    } catch (erro) {
      console.error('❌ Erro ao atualizar status:', erro.message)
      return null
    }
  }
}

module.exports = new Database()
