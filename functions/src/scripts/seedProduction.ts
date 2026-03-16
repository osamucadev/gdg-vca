import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env.production') })

const app = initializeApp({
  credential: cert({
    projectId: process.env['FIREBASE_PROJECT_ID'],
    clientEmail: process.env['FIREBASE_CLIENT_EMAIL'],
    privateKey: process.env['FIREBASE_PRIVATE_KEY']?.replace(/\\n/g, '\n'),
  }),
})

const db = getFirestore(app)

const permissions = {
  'events.create': false,
  'events.edit': false,
  'events.publish': false,
  'events.archive': false,
  'posts.create': false,
  'posts.edit': false,
  'posts.publish': false,
  'posts.archive': false,
  'announcements.create': false,
  'announcements.edit': false,
  'announcements.publish': false,
  'announcements.archive': false,
  'pages.edit': false,
  'homeBlocks.edit': false,
  'partners.create': false,
  'partners.edit': false,
  'media.upload': false,
  'contact.read': false,
  'audit.read': false,
  'versions.read': false,
  'versions.restore': false,
  'adminUsers.manage': false,
  'system.rebuild': false,
}

const roles = [
  {
    id: 'owner',
    permissions: Object.fromEntries(Object.keys(permissions).map((k) => [k, true])),
  },
  {
    id: 'admin',
    permissions: {
      ...Object.fromEntries(Object.keys(permissions).map((k) => [k, true])),
      'system.rebuild': false,
    },
  },
  {
    id: 'editor',
    permissions: {
      ...permissions,
      'events.create': true,
      'events.edit': true,
      'events.publish': true,
      'events.archive': true,
      'posts.create': true,
      'posts.edit': true,
      'posts.publish': true,
      'posts.archive': true,
      'announcements.create': true,
      'announcements.edit': true,
      'announcements.publish': true,
      'announcements.archive': true,
      'media.upload': true,
      'versions.read': true,
    },
  },
  {
    id: 'media_manager',
    permissions: { ...permissions, 'media.upload': true },
  },
  {
    id: 'inbox_viewer',
    permissions: { ...permissions, 'contact.read': true },
  },
]

const homeBlocks = [
  {
    id: 'top-bar',
    type: 'top-bar',
    enabled: false,
    order: 0,
    props: { text: 'Bem-vindo ao GDG Vitória da Conquista!', variant: 'brand' },
  },
  {
    id: 'hero',
    type: 'hero',
    enabled: true,
    order: 1,
    props: {
      title: 'GDG Vitória da Conquista',
      subtitle: 'Comunidade de desenvolvedores do sudoeste baiano',
      contentAlign: 'center',
      themeVariant: 'dark',
      overlayVariant: 'dark',
      ctaLabel: 'Ver eventos',
      ctaUrl: '/eventos',
      ctaTarget: 'same_tab',
    },
  },
  {
    id: 'countdown-banner',
    type: 'countdown-banner',
    enabled: false,
    order: 2,
    props: {
      title: 'Próximo evento',
      mode: 'next_upcoming',
      themeVariant: 'brand',
      overlayVariant: 'dark',
    },
  },
  {
    id: 'events-carousel',
    type: 'events-carousel',
    enabled: true,
    order: 3,
    props: {
      title: 'Próximos eventos',
      mode: 'upcoming',
      maxItems: 6,
      ctaLabel: 'Ver todos os eventos',
      ctaUrl: '/eventos',
    },
  },
  {
    id: 'announcements-carousel',
    type: 'announcements-carousel',
    enabled: true,
    order: 4,
    props: {
      title: 'Avisos',
      maxItems: 4,
      zone: 'home_carousel',
      ctaLabel: 'Ver todos os avisos',
      ctaUrl: '/avisos',
    },
  },
  {
    id: 'image-carousel',
    type: 'image-carousel',
    enabled: false,
    order: 5,
    props: { title: 'Galeria', images: [], autoplay: true, aspectRatioVariant: 'landscape' },
  },
  {
    id: 'cta-banner',
    type: 'cta-banner',
    enabled: false,
    order: 6,
    props: {
      title: 'Faça parte da comunidade',
      subtitle: 'Junte-se ao GDG Vitória da Conquista',
      contentAlign: 'center',
      backgroundVariant: 'brand',
      overlayVariant: 'none',
      ctaLabel: 'Saiba mais',
      ctaUrl: '/sobre',
      ctaTarget: 'same_tab',
    },
  },
  {
    id: 'contact-form',
    type: 'contact-form',
    enabled: true,
    order: 7,
    props: {
      title: 'Entre em contato',
      subtitle: 'Tem alguma dúvida ou proposta? Fale com a gente.',
      submitLabel: 'Enviar mensagem',
      successMessage: 'Mensagem enviada! Em breve entraremos em contato.',
    },
  },
]

async function seed() {
  console.log('Seeding roles...')
  const batch = db.batch()

  for (const role of roles) {
    batch.set(db.collection('roles').doc(role.id), {
      name: role.id,
      permissions: role.permissions,
      updatedAt: new Date(),
    })
  }

  for (const block of homeBlocks) {
    batch.set(db.collection('homeBlocks').doc(block.id), {
      type: block.type,
      enabled: block.enabled,
      order: block.order,
      schemaVersion: 1,
      props: block.props,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  await batch.commit()
  console.log('Done. Roles and home blocks seeded successfully.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
