import router from '@adonisjs/core/services/router'
import { middleware } from '../kernel.js'

// Conversations controllers
const ConversationsController = () => import('#controllers/conversations/conversations_controller')
const ConversationController = () => import('#controllers/conversations/conversation_controller')

router
  .group(() => {
    // New style conversation routes
    router.get('/conversations', [ConversationsController, 'index']).as('conversations.index')
    router
      .get('/conversations/create', [ConversationsController, 'create'])
      .as('conversations.create')
    router.post('/conversations', [ConversationsController, 'store']).as('conversations.store')
    router.get('/conversations/:id', [ConversationsController, 'show']).as('conversations.show')
    router
      .post('/conversations/:id/messages', [ConversationsController, 'sendMessage'])
      .as('conversations.send_message')
    router
      .post('/conversations/:id/mark-as-read', [ConversationsController, 'markAsRead'])
      .as('conversations.mark_as_read')

    // Legacy conversation routes
    router.get('/conversation', [ConversationController, 'index']).as('conversation.index')
    router.get('/conversation/create', [ConversationController, 'create']).as('conversation.create')
    router.post('/conversation', [ConversationController, 'store']).as('conversation.store')
    router.get('/conversation/:id', [ConversationController, 'show']).as('conversation.show')
    router
      .post('/conversation/:id/participants', [ConversationController, 'addParticipant'])
      .as('conversation.add_participant')
    router
      .post('/conversation/:id/messages', [ConversationController, 'sendMessage'])
      .as('conversation.send_message')
    router
      .post('/conversation/:id/mark-as-read', [ConversationController, 'markAsRead'])
      .as('conversation.mark_as_read')
    router
      .delete('/conversation/:id', [ConversationController, 'destroy'])
      .as('conversation.destroy')
  })
  .use(middleware.auth())
