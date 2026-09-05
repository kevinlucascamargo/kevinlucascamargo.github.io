# kevinlucascamargo.github.io

Portfólio pessoal de **Kevin Lucas Camargo** — Senior Product Manager.
Site bilíngue (PT/EN) publicado em <https://kevinlucascamargo.github.io>.

## Sobre o conteúdo

Os cases descrevem projetos por **problema, método e tipo de resultado**.
Projetos executados sob acordo de confidencialidade não reproduzem nenhum
documento, número ou dado de cliente. Os diagramas são reconstruções genéricas,
desenhadas especificamente para este portfólio, sem informação proprietária.

## Stack

Sem framework, sem build step, sem dependência de runtime. HTML, CSS e
JavaScript puro, servidos estaticamente pelo GitHub Pages.

```
index.html              estrutura da página
assets/css/style.css    design system em CSS custom properties
assets/js/data.js       todo o conteúdo, em pt e en
assets/js/app.js        renderização, i18n, tema e diagramas SVG
```

**Decisões que valem nota:**

- **Conteúdo separado de apresentação.** Todo texto vive em `data.js`, com as
  duas línguas lado a lado. Trocar de idioma re-renderiza a partir da mesma
  estrutura — não existem dois HTMLs para manter em sincronia.
- **Diagramas em SVG gerado por código,** não imagens. Herdam a paleta via
  `currentColor` e custom properties, então funcionam em tema claro e escuro
  sem exportar dois arquivos, e os rótulos são traduzidos como qualquer outro
  texto.
- **Tema em três estados:** claro, escuro e o padrão do sistema. A escolha
  explícita fica em `localStorage`, sempre dentro de `try/catch` — em janela
  anônima ou com storage bloqueado a página continua funcionando.

## Rodando localmente

```bash
python -m http.server 4173
```

Depois abra <http://localhost:4173>.

## Licença

O código é livre para consulta e reuso. O conteúdo textual e a trajetória
profissional descrita são de autoria de Kevin Lucas Camargo.
