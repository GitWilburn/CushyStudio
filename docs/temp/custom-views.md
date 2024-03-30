# Custom Views

ou can now define your own custom "outputs",
Cushy have built-in outputs types like `image`, `text`, `markdown`, `html`, `video`, `displacement`, `gaussian spats`

but you can extend that  define your own custom output type using the


```ts
//               👇
const demoView = view<{ emoji: string }>({
    preview: (p) => <div>{p.emoji}</div>,
    render: (p) => <div>hello, you picked the emoji {p.emoji}</div>,
})

app({
    metadata: { name: 'Custom view demo', description: 'Demo of a custom view' },
    ui: (ui) => ({}),
    run: async (run, ui) => {
        run.output_custom({
            view: demoView,
            params: {
                emoji: '❤️',
            },
        })
    },
})

```

![](https://cushy.fra1.cdn.digitaloceanspaces.com/rvion/00ea4220988fe19f626c2d3f4cd95eea91c429bd.jpg)

![](https://cushy.fra1.cdn.digitaloceanspaces.com/rvion/00ea4220988fe19f626c2d3f4cd95eea91c429bd.jpg)
