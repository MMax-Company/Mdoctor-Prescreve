function errorHandler(err, req, res, next) {
  console.error('❌ Erro:', err.message)
  
  res.status(500).json({
    erro: 'Erro interno do servidor',
    mensagem: process.env.NODE_ENV === 'development' ? err.message : 'Tente novamente mais tarde'
  })
}

module.exports = errorHandler
