# Software Development Plan (SDP)
## Data Attributes Automation Project

**Version:** 1.0  
**Date:** July 2025  
**Lead Developer:** Abdullah  


---

## 1. 📘 Introduction & Objectives

### Purpose
Build a robust, maintainable script that automatically tags user interactions (`<a>`, `<button>`, `<input>`, `<select>`, `<textarea>`, and other interactive elements) with `data-type`, `data-action`, `data-context`, and `data-value` attributes for analytics and telemetry.

### Goals
- **Semantic tagging** for accurate analytics and measurement
- **Framework-agnostic** (works with React, Vue, Angular, or vanilla JS)
- **Testable** via unit and integration tests
- **TMS ready** as a vanilla JavaScript file for easy injection

### Success Criteria
- 95%+ test coverage
- Zero false positives in tag assignment
- <100ms performance impact
- Seamless integration with any tag management system

---

## 2. 📂 Project Organization

### Team Structure
- **Lead Developer (Abdullah)**: Develop core logic, tests, and pipeline
- **Frontend Engineers**: Integrate and maintain script in codebase or GTM
- **QA/Test Engineer** (future): Support E2E test scenarios
- **Stakeholders**: Analytics team (requirements & validation), Infra/CI (pipeline integration)

### Responsibilities Matrix
| Role | Core Logic | Testing | Integration | Documentation |
|------|------------|---------|-------------|---------------|
| Lead Developer | ✅ | ✅ | ✅ | ✅ |
| Frontend Engineers | 🔄 | 🔄 | ✅ | 🔄 |
| QA Engineer | 🔄 | ✅ | 🔄 | 🔄 |
| Analytics Team | 🔄 | ✅ | 🔄 | ✅ |

---

## 3. 🛠 Technology Stack

### Core Technologies
- **Language**: TypeScript
- **Build Tool**: Vite
- **Unit Testing**: Jest + jsdom
- **E2E Testing**: Playwright
- **CI/CD**: GitHub Actions

### Dependencies
```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^7.0.3",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "jsdom": "^latest",
    "jest-environment-jsdom": "^latest",
    "@types/jsdom": "^latest",
    "playwright": "^1.40.0",
    "@playwright/test": "^1.40.0"
  }
}
```

*Note: `jest-environment-jsdom` is required for Jest 28+ and above, as it is no longer bundled by default.*

*The file `jest.setup.js` is included and referenced in `jest.config.js` via the `setupFiles` option. This ensures `TextEncoder` and `TextDecoder` are available globally before any test or import runs, which is required for compatibility with jsdom and some Node.js/Jest versions. The setup file uses `require` (not `import`) for maximum compatibility, as Jest setup files are executed as CommonJS modules. Do not remove or rename `jest.setup.js` or its reference in `jest.config.js`.*

---

## 4. 🧭 Test Plan

### Testing Strategy

| Area | Method | Description | Coverage Target |
|------|--------|-------------|-----------------|
| **Unit** | Jest + jsdom | Validate tag assignment logic (determineType, determineAction, determineContext) | 95% |
| **E2E** | Playwright | Inject script, simulate clicks, assert data-* attributes | 90% |

*See the note above regarding the required Jest setup file for TextEncoder/TextDecoder polyfill.*

### Test Scenarios

#### Unit Tests (Jest + jsdom)
- Type determination for different input types (checkbox, radio, file, etc.)
- Action inference from aria-label, textContent, and title attributes
- Context detection from parent elements and semantic sections
- Edge cases (empty content, deeply nested elements)
- Selector matching and attribute preservation

#### E2E Tests (Playwright)
- Script injection and initialization
- Dynamic content updates and DOM mutations
- Cross-browser compatibility
- Performance impact measurement

---

## 5. 🏗 Architecture & Pipeline

### Source Files Structure
```
src/
├── core/
│   ├── tagger.ts          # Core tagger logic
│   ├── types.ts           # TypeScript interfaces
│   ├── utils.ts           # Utility functions
│   └── index.ts           # Public exports
├── tests/
│   ├── unit/              # Jest tests
│   └── e2e/               # Playwright tests
├── browser/               # Build output (generated)
│   └── tagger.mjs        # Distributable JavaScript
└── test.html              # Manual testing page
```

### Build Pipeline
```bash
# Development
npm run dev          # TypeScript watch mode
npm run test         # Jest unit tests
npm run test:e2e     # Playwright E2E tests

# Production
npm run build        # Vite build to browser/tagger.mjs
npm run test:all     # Run all test suites
```

### CI/CD Integration
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e
      - run: npm run build
```

### Deployment Options
1. **GTM Integration**: Copy `browser/tagger.mjs` content and inject via GTM Custom HTML tag
2. **TMS Integration**: Same approach for Tealium, Adobe Launch, etc.
3. **Direct Integration**: Include script in page templates
4. **CDN Distribution**: Host bundled script on CDN

---

## 6. 🚨 Risk & Mitigation

### Identified Risks

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|-------------------|
| **DOM Variability** | High | Medium | Comprehensive Jest + E2E test cases |
| **Framework Conflicts** | Medium | High | Test with multiple frameworks (React, Vue, Angular) |
| **Performance Impact** | High | Low | Benchmark and optimize tag assignment logic |
| **TMS Compatibility** | Medium | Medium | Test with multiple TMS configurations |

### Contingency Plans
- **Fallback Strategy**: Graceful degradation if script fails
- **Rollback Plan**: Version control with quick rollback capability
- **Monitoring**: Real-time error tracking and alerting

---

## 7. 📝 Documentation & Communication

### Documentation Requirements
- **README.md**: Installation, usage, testing, and integration steps
- **API Documentation**: Core functions and interfaces
- **Integration Guide**: Step-by-step setup for GTM and other TMS
- **Tutorial**: Non-developer guide for TMS updates

### Communication Plan
- **Weekly Updates**: Progress reports to stakeholders
- **Test Coverage Reports**: Shared with analytics team
- **Release Notes**: Detailed changelog for each version
- **Demo Sessions**: Live demonstrations of functionality

---

## 8. 📅 Timeline & Milestones

### Phase Breakdown

| Phase | Task | Est. Time | Dependencies | Deliverables |
|-------|------|-----------|--------------|--------------|
| **0** | Setup repo, build pipeline | 1 day | None | Project structure, CI/CD |
| **1** | Write tagger.ts, Jest tests | 1-2 days | Phase 0 | Core logic, unit tests |
| **2** | Vite build + browser script | 1 day | Phase 1 | Production-ready script |
| **3** | Playwright E2E tests | 1 day | Phase 2 | E2E test suite |
| **4** | CI/CD & staging deployment | 1-2 days | Phase 3 | Automated pipeline |
| **5** | Document & demo hand-off | 1 day | All phases | Complete documentation |

### Critical Path
```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
```

### Milestone Checkpoints
- **Week 1**: Core functionality and unit tests
- **Week 2**: E2E testing and integration
- **Week 3**: Deployment and documentation

---

## 9. 🌟 GTM/TMS Integration

### Deployment Options

#### Option 1: Self-Executing Function (Recommended for TMS)
Convert the class-based logic into a self-executing function that can be directly pasted into GTM Custom HTML tags:

```javascript
// GTM Custom HTML Tag Content
(function() {
  // Converted class logic as self-executing function
  // No class instantiation needed - runs immediately
  // All logic encapsulated in IIFE
})();
```

#### Option 2: Class-Based (For Direct Integration)
Keep the current class-based approach for:
- Direct script inclusion in page templates
- CDN hosting and referencing
- Framework integration

#### Option 3: Hybrid Approach
Provide both versions:
- `tagger.mjs` - Class-based for direct integration
- `tagger-gtm.js` - Self-executing function for TMS integration

### TMS Integration Benefits
- **GTM Compatible**: Self-executing function format works in Custom HTML tags
- **Tealium Compatible**: Same approach works in Tealium Custom Tags
- **Adobe Launch Compatible**: Compatible with Adobe Launch custom code
- **Framework-agnostic**: Works with any frontend framework
- **Self-contained**: No external dependencies
- **Easy deployment**: Copy-paste integration

### Implementation Strategy
1. **For TMS deployment**: Convert to self-executing function format
2. **For direct integration**: Use existing class-based approach
3. **Build process**: Generate both versions from TypeScript source

---

## 10. ✅ Summary & Next Steps

### Project Summary
- Build core logic in TypeScript with comprehensive testing
- Use Vite for efficient builds
- Test via Jest + Playwright
- Setup CI/CD for sustainable integration
- Provide vanilla JS output for easy TMS integration

### Immediate Actions
1. ✅ **Initialize repository** with TypeScript configuration
2. ✅ **Set up build pipeline** with Vite and Jest
3. ✅ **Create core tagger logic** with comprehensive unit tests
4. 🔄 **Implement E2E testing** with Playwright
5. 🔄 **Deploy to staging** with CI/CD integration

### Success Metrics
- **Code Coverage**: >95% unit tests, >90% E2E tests
- **Performance**: <100ms impact on page load
- **Reliability**: Zero false positives in tag assignment
- **Adoption**: Seamless integration with existing TMS workflows

---

**Document Version:** 1.1  
**Last Updated:** July 2025  
**Next Review:** After Phase 3 completion 