// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Provide minimal Fetch API globals so Next.js route handlers can be imported in Jest.
if (!globalThis.Request) {
  globalThis.Request = class Request {}
}
if (!globalThis.Response) {
  globalThis.Response = class Response {}
}
if (!globalThis.Headers) {
  globalThis.Headers = class Headers {}
}
if (!globalThis.fetch) {
  globalThis.fetch = async () => {
    throw new Error('fetch not implemented in Jest environment')
  }
}

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.OPENAI_API_KEY = 'test-openai-key'
process.env.TWITTER_CLIENT_ID = 'test-twitter-client-id'
process.env.TWITTER_CLIENT_SECRET = 'test-twitter-client-secret'
process.env.LINKEDIN_CLIENT_ID = 'test-linkedin-client-id'
process.env.LINKEDIN_CLIENT_SECRET = 'test-linkedin-client-secret'
process.env.QSTASH_TOKEN = 'test-qstash-token'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
