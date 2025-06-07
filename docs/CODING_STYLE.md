# Coding Style Guidelines

## Philosophy

This codebase follows clean code principles emphasized in Learning Hours. Code should be self-documenting through excellent naming and small, focused functions rather than relying on comments.

> "I do not like comments. They lie and clutter the code. Instead I prefer small methods with good names."

## Core Principles

### 1. Expressive Naming
Functions, variables, and classes should clearly communicate their purpose:

```typescript
// Good
function extractLearningGoals(sessionContent: string): string[]
function calculateSessionDuration(startTime: Date, endTime: Date): number
const participantFeedback = collectReflections()

// Avoid
function process(data: string): string[]
function calc(a: Date, b: Date): number
const feedback = getStuff()
```

### 2. Small, Focused Functions
Each function should do one thing well:

```typescript
// Good
function createLearningSession(title: string, duration: number): LearningSession {
  return new LearningSession(title, duration)
}

function validateSessionDuration(duration: number): boolean {
  return duration >= 30 && duration <= 120
}

// Avoid large functions that do multiple things
```

### 3. Single Responsibility
Each class and module should have one reason to change:

```typescript
// Good
class SessionFacilitator {
  facilitateSession(session: LearningSession): void
}

class SessionScheduler {
  scheduleSession(session: LearningSession, date: Date): void
}

// Avoid classes that handle multiple concerns
```

### 4. No Comments
Code should be self-explaining. If you feel the need to add a comment, consider refactoring instead:

```typescript
// Good
function extractMethodRefactoring(codeBlock: string): RefactoredCode {
  const methodName = generateMethodName(codeBlock)
  const parameters = identifyParameters(codeBlock)
  return createNewMethod(methodName, parameters, codeBlock)
}

// Avoid
function process(code: string): any {
  // Extract the method name from the code block
  const name = getMethodName(code)
  // Find all the parameters that need to be passed
  const params = getParams(code)
  // Create the new method with extracted logic
  return makeMethod(name, params, code)
}
```

## TypeScript Conventions

### Type Definitions
Use clear, descriptive type names that reflect domain concepts:

```typescript
interface LearningSession {
  title: string
  duration: number
  phase: LearningPhase
  participants: Participant[]
}

type LearningPhase = 'connect' | 'concept' | 'concrete' | 'conclusion'

interface SessionFeedback {
  participantId: string
  satisfaction: number
  keyTakeaways: string[]
}
```

### Error Handling
Use explicit error types and clear error messages:

```typescript
class SessionValidationError extends Error {
  constructor(message: string) {
    super(`Session validation failed: ${message}`)
  }
}

function validateSession(session: LearningSession): void {
  if (session.duration < 30) {
    throw new SessionValidationError('Duration must be at least 30 minutes')
  }
}
```

## File Organization

### Directory Structure
Organize code by domain concepts rather than technical layers:

```
src/
├── session/
│   ├── LearningSession.ts
│   ├── SessionFacilitator.ts
│   └── SessionScheduler.ts
├── feedback/
│   ├── FeedbackCollector.ts
│   └── ReflectionAnalyzer.ts
└── practice/
    ├── CodeKata.ts
    └── PracticeExercise.ts
```

### File Naming
Use descriptive names that reflect the file's primary responsibility:

```
// Good
LearningSessionBuilder.ts
FourCModelImplementation.ts
TechnicalPracticeRegistry.ts

// Avoid
Utils.ts
Helper.ts
Manager.ts
```

## Testing Conventions

### Test Naming
Test names should clearly describe the behavior being tested:

```typescript
describe('LearningSession', () => {
  it('should create session with valid duration', () => {
    // test implementation
  })
  
  it('should reject session with duration less than 30 minutes', () => {
    // test implementation
  })
  
  it('should progress through all four learning phases', () => {
    // test implementation
  })
})
```

### Test Structure
Follow the Arrange-Act-Assert pattern:

```typescript
it('should calculate session completion percentage', () => {
  // Arrange
  const session = createLearningSession('TDD Basics', 60)
  session.completePhase('connect')
  session.completePhase('concept')
  
  // Act
  const completionPercentage = session.getCompletionPercentage()
  
  // Assert
  expect(completionPercentage).toBe(50)
})
```

## Refactoring Guidelines

### Extract Method
When a function becomes too long, extract logical chunks into well-named methods:

```typescript
// Before
function facilitateSession(session: LearningSession): void {
  console.log(`Starting ${session.title}`)
  session.participants.forEach(p => p.notifyStart())
  runConnectPhase(session)
  runConceptPhase(session)
  runConcretePhase(session)
  runConclusionPhase(session)
  session.participants.forEach(p => p.notifyComplete())
  console.log(`Completed ${session.title}`)
}

// After
function facilitateSession(session: LearningSession): void {
  startSession(session)
  runLearningPhases(session)
  completeSession(session)
}
```

### Rename Variables
Use names that express intent clearly:

```typescript
// Good
const activeLearningSession = getCurrentSession()
const participantCount = session.participants.length
const hasReachedMinimumDuration = duration >= 30

// Avoid
const session = getCurrent()
const count = session.participants.length
const valid = duration >= 30
```

This style guide ensures code remains maintainable, readable, and aligned with the technical excellence principles taught in Learning Hours.