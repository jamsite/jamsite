module.exports = function getDefaultHandler (jamsite) {
  const errorsConfig = jamsite.config.errors || {}

  return async function defaultHandler (req, res) {
    const page404 = errorsConfig['404']
    const page50x = errorsConfig['50x']

    const headers = {
      'Content-Type': 'text/html; charset=utf-8'
    }

    let code = 404
    let content = errorMsg(code, 'The requested path could not be found.')

    if (page404) {
      const page = await jamsite.pageByUrl(page404)
      if (page) {
        content = errorMsg(code, page.content)
        page.setHeaders(res)
      } else {
        code = 500
        content = errorMsg(code, 'Server error.')
        if (page50x) {
          const page = await jamsite.pageByUrl(page50x)
          if (page) {
            content = page.content
            page.setHeaders(res)
          }
        }
      }
    }

    res.writeHead(code, headers)
    res.end(content)
  }
}

const errorMsg = (statusCode, message) => `<!DOCTYPE html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no"/>

  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
      cursor: default;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
    }

    main,
    aside,
    section {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }

    main {
      height: 100%;
    }

    aside {
      background: #000;
      flex-shrink: 1;
      padding: 30px 20px;
    }

    aside p {
      margin: 0;
      color: #999999;
      font-size: 14px;
      line-height: 24px;
    }

    aside a {
      color: #fff;
      text-decoration: none;
    }

    section span {
      font-size: 24px;
      font-weight: 500;
      display: block;
      border-bottom: 1px solid #EAEAEA;
      text-align: center;
      padding-bottom: 20px;
      width: 100px;
    }

    section p {
      font-size: 14px;
      font-weight: 400;
    }

    section span + p {
      margin: 20px 0 0 0;
    }

    @media (min-width: 768px) {
      section {
        height: 40px;
        flex-direction: row;
      }

      section span,
      section p {
        height: 100%;
        line-height: 40px;
      }

      section span {
        border-bottom: 0;
        border-right: 1px solid #EAEAEA;
        padding: 0 20px 0 0;
        width: auto;
      }

      section span + p {
        margin: 0;
        padding-left: 20px;
      }

      aside {
        padding: 50px 0;
      }

      aside p {
        max-width: 520px;
        text-align: center;
      }
    }
  </style>
</head>

<body>
  <main>
    <section>
      <span>${statusCode}</span>
	  <p>${message}</p>
    </section>
  </main>
</body>
`
