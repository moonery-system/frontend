# Roteiro de teste manual — assistente no chat

**Só em desenvolvimento, só com dados de seed.** A camada gratuita do Gemini pode usar entradas
e saídas para melhorar modelos: nunca rode isto com clientes reais.

Cada resposta do assistente leva de 6 a ~20 s (medido). Os passos com "aguarde" dependem disso.

## Preparo

1. Stack de pé, com o serviço `assistant-consumer` (`docker compose up -d assistant-consumer`) e
   o `.env` do `api/` com `GEMINI_API_KEY`/`ASSISTANT_MODEL`.
2. Banco de dev migrado e com o bot: `php artisan migrate` e
   `php artisan db:seed --class=AssistantSeeder` (idempotente).
3. Frontend: `docker compose up -d frontend` (porta 8082) ou `cd frontend && npm run serve`.
4. Duas janelas (ou uma anônima): **cliente** `client@gmail.com` / `client` e **Suporte**
   `support@gmail.com` / `support`, esta em `/support`.
5. A entrega de teste é `MNY-2026-SEED02` (status `pending`). Se não estiver `pending`, veja
   "Restaurar" no fim.

> **Aviso:** o passo 6 (**Confirm cancellation**) cancela a SEED02 de verdade. Faça-o por último,
> e restaure depois.

Os textos do bot ("Confirma o cancelamento…", "Tudo bem, mantive…") vêm **em português do
backend**; a interface (botões, avisos) está em inglês. É esperado.

## 1. Indicador "assistente respondendo"

Cliente: abra o chat (botão laranja, canto inferior esquerdo) e envie
`Onde está a minha entrega MNY-2026-SEED01?`.

- Em ~1 s aparece **"The assistant is replying…"** (três pontos) acima do campo de texto.
- Quando a resposta chega (bolha dourada, rótulo **Assistant**), o indicador some sozinho.
- Login como **entregador** ou **Admin** e mesma pergunta: o indicador **não** aparece (o
  assistente só responde clientes).

## 2. Cartão de confirmação — manter a entrega

Cliente: `Quero cancelar a entrega MNY-2026-SEED02, por favor.`

- Chega uma bolha do assistente com a pergunta e **dois botões**: **Confirm cancellation** e
  **Keep delivery** (os dois empilhados, altura mínima de 40 px).
- Clique **Keep delivery**: os botões desabilitam ("Keeping…"), depois o cartão mostra
  **"Delivery kept."**, o foco vai para esse texto e o assistente escreve "Tudo bem, mantive…".
- A SEED02 continua `pending` (confira em Deliveries).

## 3. Visão do Suporte (só leitura)

Enquanto o cartão do passo 2 estava pendente, na janela do Suporte (sem recarregar):

- A conversa do cliente aparece na lista e a thread mostra o mesmo cartão **sem botões**, com
  **"Waiting for the customer to confirm."**. Depois do passo 2 vira **"Customer kept the delivery."**.

## 4. Expiração

Peça o cancelamento de novo (novo cartão). Antes de clicar, no banco:

```sql
update assistant_pending_actions
   set expires_at = now() + interval '20 seconds'
 where status = 'pending';
```

- Recarregue o chat: em ~20 s o cartão vira **"This confirmation expired. Ask the assistant
  again."** sozinho, sem clique, e os botões somem.
- Peça o cancelamento uma terceira vez e faça o `update` com `now() - interval '1 minute'`:
  ao abrir o chat o cartão já nasce expirado.

## 5. Recusa (409) em linguagem simples

Com um cartão pendente aberto, mova a entrega antes de clicar:

```sql
update deliveries
   set delivery_status_id = (select id from delivery_status where name = 'picked_up')
 where tracking_code = 'MNY-2026-SEED02';
```

Clique **Confirm cancellation**:

- O cartão vira **"Couldn't cancel: the delivery is now picked up and can't be canceled here.
  Contact support if you need help."** — sem texto técnico —, os botões somem e o foco vai para
  o texto. O assistente acrescenta a mensagem "Não consegui cancelar…".
- O Console do navegador mostra um `409` esperado.
- Restaure a SEED02 (abaixo) antes de seguir.

## 6. Erro de rede e nova tentativa

Com um cartão pendente: DevTools → Network → **Offline**, clique **Keep delivery**.

- O cartão mostra **"Couldn't reach the server. Try again."** com o botão **Try again**.
- Volte a **Online** e clique **Try again**: repete a **mesma** escolha e resolve normalmente.
- Duplo clique rápido nos botões nunca envia duas requisições (aba Network).

## 7. Encaminhamento ao Suporte

Cliente: `Quero falar com uma pessoa, por favor.` (a conversa precisa estar `active`: veja
"Restaurar".)

- Cliente: depois do indicador, aparece a faixa **"This conversation was handed over to support.
  A person will reply here soon."**; o campo de texto continua habilitado.
- Suporte, **sem recarregar**: a conversa ganha o selo **"Assistant asked for help"** na lista e
  no cabeçalho da thread.
- Suporte responde na thread: o selo vira **"Answered by support"** (neutro) e o assistente não
  responde mais naquela conversa.

## 8. Demora do assistente (45 s)

Pare o consumidor e mande uma mensagem como cliente (conversa `active`):

```bash
docker compose stop assistant-consumer
```

- **"The assistant is replying…"** por 45 s; então **"This is taking longer than usual. Your
  message was received; if the assistant can't answer, support takes over."**
- Nesse período o chat recarrega sozinho a cada 5 s (aba Network: `GET /conversations/me`).
- Religue: `docker compose start assistant-consumer`. A mensagem estava na fila: a resposta chega
  em segundos e o aviso some sozinho.

## 9. Teclado e leitor de tela

- Só teclado: `Tab` até os botões do cartão, `Enter`/`Espaço` acionam; o foco visível é o anel
  laranja. Depois de resolver, o foco fica no texto de status (não volta ao topo da página).
- Leitor de tela: as mudanças de estado ("Confirming…", "Cancellation confirmed.", o indicador e
  o aviso de encaminhamento) são anunciadas (`aria-live="polite"`); o grupo do cartão é lido com a
  pergunta como rótulo.
- Estreite a janela (< 640 px): o chat continua utilizável e os botões não estouram a largura.

## Restaurar

Sem apagar o banco:

```sql
update deliveries
   set delivery_status_id = (select id from delivery_status where name = 'pending')
 where tracking_code = 'MNY-2026-SEED02';

update conversations
   set assistant_status = 'active', handed_off_at = null, handoff_reason = null;
```

Se o passo de **Confirm cancellation** cancelou de verdade a SEED02, o `update` acima também a
devolve a `pending` (o histórico de status fica com o registro do cancelamento). Para voltar ao
estado de fábrica: `docker compose exec laravel php artisan customs:refresh-db` — **apaga todo o
banco de dev** e semeia de novo (inclusive o bot).
