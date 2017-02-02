var testsContext = require.context('./test/', true, /\.jsx$/)
testsContext.keys().forEach(testsContext)
