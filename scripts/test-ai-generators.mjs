#!/usr/bin/env node

/**
 * Test AI Content Generators
 * Tests Twitter and LinkedIn content generation functions
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

console.log('🧪 Testing AI Content Generators\n')

let passed = 0
let failed = 0

// Test 1: Environment Setup
console.log('Test 1: Environment Setup')
try {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not found')
  }

  console.log('  ✅ PASS - OpenAI API key configured')
  console.log(`     Key: ${process.env.OPENAI_API_KEY.substring(0, 15)}...`)
  passed++
} catch (error) {
  console.log('  ❌ FAIL:', error.message)
  failed++
}

// Test 2: Import Twitter Generator
console.log('\nTest 2: Import Twitter Generator')
try {
  const twitterModule = await import('../lib/ai/twitter-generator.ts')

  if (twitterModule.generateTwitterThread && twitterModule.generateSingleTweet) {
    console.log('  ✅ PASS - Twitter generator module loaded')
    console.log('     Functions: generateTwitterThread, generateSingleTweet, optimizeThread')
    passed++
  } else {
    throw new Error('Missing expected functions')
  }
} catch (error) {
  console.log('  ❌ FAIL:', error.message)
  failed++
}

// Test 3: Import LinkedIn Generator
console.log('\nTest 3: Import LinkedIn Generator')
try {
  const linkedinModule = await import('../lib/ai/linkedin-generator.ts')

  if (linkedinModule.generateLinkedInPost && linkedinModule.generateLinkedInCarousel) {
    console.log('  ✅ PASS - LinkedIn generator module loaded')
    console.log('     Functions: generateLinkedInPost, generateLinkedInCarousel, generateLinkedInArticle')
    passed++
  } else {
    throw new Error('Missing expected functions')
  }
} catch (error) {
  console.log('  ❌ FAIL:', error.message)
  failed++
}

// Test 4: Generate Twitter Thread (Live Test)
console.log('\nTest 4: Generate Twitter Thread (Live Test)')
try {
  const { generateTwitterThread } = await import('../lib/ai/twitter-generator.ts')

  console.log('  🔄 Calling OpenAI API...')

  const result = await generateTwitterThread({
    sourceContent: 'The key to successful content marketing is consistency. Post regularly, engage authentically, and provide real value to your audience.',
    threadLength: 'short',
    threadType: 'tips',
    tone: 'professional',
    includeHashtags: true
  })

  if (result.tweets && result.tweets.length >= 3 && result.tweets.length <= 7) {
    console.log('  ✅ PASS - Thread generated successfully')
    console.log(`     Tweets: ${result.totalTweets}`)
    console.log(`     Type: ${result.threadType}`)
    console.log(`     Hook: "${result.tweets[0].text.substring(0, 50)}..."`)
    console.log(`     CTA: "${result.cta.substring(0, 50)}..."`)

    // Verify character limits
    const oversizedTweets = result.tweets.filter(t => t.characterCount > 280)
    if (oversizedTweets.length === 0) {
      console.log('  ✅ All tweets under 280 characters')
      passed++
    } else {
      throw new Error(`${oversizedTweets.length} tweets over 280 characters`)
    }
  } else {
    throw new Error(`Expected 3-7 tweets, got ${result.tweets?.length || 0}`)
  }
} catch (error) {
  console.log('  ❌ FAIL:', error.message)
  failed++
}

// Test 5: Generate LinkedIn Post (Live Test)
console.log('\nTest 5: Generate LinkedIn Post (Live Test)')
try {
  const { generateLinkedInPost } = await import('../lib/ai/linkedin-generator.ts')

  console.log('  🔄 Calling OpenAI API...')

  const result = await generateLinkedInPost({
    sourceContent: 'Building a successful SaaS requires focus on three pillars: product-market fit, customer success, and sustainable growth.',
    postLength: 'short',
    postStyle: 'thought-leadership',
    tone: 'professional',
    includeHashtags: true
  })

  if (result.post && result.post.length > 100 && result.post.length <= 3000) {
    console.log('  ✅ PASS - LinkedIn post generated successfully')
    console.log(`     Characters: ${result.characterCount}`)
    console.log(`     Has Hook: ${result.hasHook}`)
    console.log(`     Hashtags: ${result.hashtags.length}`)
    console.log(`     Preview: "${result.post.substring(0, 80)}..."`)

    // Verify character limit
    if (result.characterCount <= 3000) {
      console.log('  ✅ Post within 3000 character limit')
      passed++
    } else {
      throw new Error('Post exceeds 3000 character limit')
    }
  } else {
    throw new Error(`Invalid post length: ${result.post?.length || 0}`)
  }
} catch (error) {
  console.log('  ❌ FAIL:', error.message)
  failed++
}

// Test 6: Generate LinkedIn Carousel (Live Test)
console.log('\nTest 6: Generate LinkedIn Carousel (Live Test)')
try {
  const { generateLinkedInCarousel } = await import('../lib/ai/linkedin-generator.ts')

  console.log('  🔄 Calling OpenAI API...')

  const result = await generateLinkedInCarousel({
    sourceContent: '5 steps to grow your online business: 1) Define your niche, 2) Build an audience, 3) Create value, 4) Launch your product, 5) Scale with systems.',
    slideCount: 7,
    carouselType: 'tips',
    includeIntroOutro: true
  })

  if (result.slides && result.coverSlide && result.closingSlide) {
    const totalSlides = 1 + result.slides.length + 1 // cover + content + closing
    console.log('  ✅ PASS - LinkedIn carousel generated successfully')
    console.log(`     Total Slides: ${totalSlides}`)
    console.log(`     Cover: "${result.coverSlide.title}"`)
    console.log(`     Content Slides: ${result.slides.length}`)
    console.log(`     Closing: "${result.closingSlide.title}"`)
    console.log(`     Caption: "${result.caption.substring(0, 60)}..."`)

    // Verify slide structure
    if (result.slides.every(s => s.title && s.content && s.content.length > 0)) {
      console.log('  ✅ All slides have title and content')
      passed++
    } else {
      throw new Error('Some slides missing title or content')
    }
  } else {
    throw new Error('Incomplete carousel structure')
  }
} catch (error) {
  console.log('  ❌ FAIL:', error.message)
  failed++
}

console.log('\n' + '='.repeat(50))
console.log(`Results: ${passed} passed, ${failed} failed`)
console.log('='.repeat(50))

if (failed === 0) {
  console.log('🎉 All AI generator tests passed!\n')
  console.log('✅ Twitter thread generation working')
  console.log('✅ LinkedIn post generation working')
  console.log('✅ LinkedIn carousel generation working')
  console.log()
  process.exit(0)
} else {
  console.log('⚠️  Some tests failed\n')
  process.exit(1)
}
