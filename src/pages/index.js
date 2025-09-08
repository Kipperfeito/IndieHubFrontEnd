import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Indie Hub</title>
        <meta
          name="description"
          content="Conecte-se, publique e colabore em jogos independentes."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white p-6">
          <h1 className="text-4xl font-bold tracking-tight">Indie Hub</h1>
        <div />

        {/* Slogan */}
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl text-center mb-10">
          O espaço onde desenvolvedores independentes compartilham projetos,
          encontram colaboradores e dão vida a novas ideias.
        </p>

        {/* Botões de ação */}
        <div className="flex gap-4">
          <a
            href="/register"
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 transition font-semibold shadow-lg"
          >
            Criar conta
          </a>
          <a
            href="/login"
            className="px-6 py-3 rounded-2xl border border-gray-500 hover:border-indigo-500 transition font-semibold"
          >
            Entrar
          </a>
        </div>

        {/* Rodapé */}
        <footer className="mt-16 text-sm text-gray-500">
          © {new Date().getFullYear()} Indie Hub. Todos os direitos reservados.
        </footer>
      </main>
    </>
  );
}
