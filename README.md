# Automated Click Tracking & Analytics

**Author:** [Abdullah Rathore](https://www.linkedin.com/in/abdullah-rathore-2460a3170/)

Eliminate manual analytics setup with automated DOM tagging and click tracking. This tool automatically identifies interactive elements, adds standardized data attributes, and captures user interactions for analytics platforms like Google Tag Manager, Tealium, Adobe Launch, and fully first party custom solutions.

**What it does:**
- **Automatically tags** interactive elements with `data-type`, `data-action`, `data-context`, and `data-value` attributes
- **Captures all clicks** and pushes structured analytics data to your preferred platform
- **Works with any analytics tool** - Google Tag Manager, Tealium, Adobe Launch, Segment, Mixpanel, or custom endpoints
- **Zero manual setup** - leverages existing semantic information in your DOM

**Enterprise Impact:**
At scale, this eliminates 2+ hours of manual telemetry/analytics work per project while adding only ~2ms to page load time. For large enterprises, this translates to numerous dev hours saved through automated click tracking across marketing campaigns, product features, and A/B tests.


## Who is this for?

**For teams that need reliable analytics without the manual work:**
- **Marketing teams** launching campaigns without engineering bottlenecks
- **Product teams** measuring feature adoption and user behavior
- **Analytics teams** ensuring consistent data collection across all web properties
- **Engineering teams** focusing on features instead of analytics infrastructure

**The problem it solves:**
Manual click tracking requires 2+ hours per project to add `data-*` attributes to every interactive element. This tool eliminates that work entirely while providing more comprehensive coverage than manual tagging.

## Installation

1. **Install Node.js**  
   Make sure you have [Node.js](https://nodejs.org/) (which includes npm) installed.

2. **Install project dependencies**  
   Run this command in your project directory:
   ```bash
   npm install
   ```
   This will install all required dependencies listed in `package.json`.

3. **(Optional) Install http-server globally**  
   If you want to use `http-server` outside of npm scripts:
   ```bash
   npm install -g http-server
   ```

## Quick Start

### 1. Build the Project
Compile the TypeScript source and generate the distributable JavaScript:
```bash
npm run build
```

### 2. Start a Local Test Server
Serve the project locally to test in your browser:
```bash
npx http-server .
```

### 3. Open the Test Page
Open your browser and navigate to:
```
http://localhost:8080/test.html
```
(Or use the address shown in your terminal after running the server.)

### 4. Check Results

- **DOM Inspection:** Right-click elements → Inspect → see data attributes applied to interactive elements.
- **Browser Console (F12):** (Optional) Success messages and logs are shown for demonstration purposes.
- **Page Display:** (Optional) The test results shown on the page are for illustration only.

> **Note:**  
> The `test.html` file and its console/page output are provided for demonstration and testing.  
> They are not required for using the core tagging logic in your own application.  
> For real usage, simply import and initialize the tagger in your project as needed.

## Note on Build Artifacts

The `browser/` folder (containing `tagger.mjs`) is generated automatically by the build process and is not included in source control. If you clone this repository, you must run:

```bash
npm run build
```

to generate the distributable JavaScript before running or testing the project.

## How It Works
- `<a>`, `<button>`, `<input>`, `<select>`, `<textarea>`, and other interactive elements are automatically tagged with standardized data attributes.
- These attributes enable seamless analytics, telemetry, and event tracking for any web project.
- You can customize which elements are tagged by adjusting the `selectors` option when initializing the tagger.

## Customizing Analytics Integration

The tool is designed to work with any analytics platform. By default, it pushes events to `window.dataLayer` (Google Tag Manager), but you can easily swap this for your preferred system.

### For Non-GTM Solutions

**What to change:**
1. **Replace the data layer push** with your preferred pub/sub system
2. **Update the event format** to match your analytics platform

**Example modifications:**

**For Segment:**
```typescript
// In tagger.ts, replace pushToDataLayer method:
function pushToDataLayer(eventObject) {
  // Replace this:
  // window.dataLayer.push(dataLayerEvent);
  
  // With this:
  analytics.track('click_event', eventObject);
}
```

**For Mixpanel:**
```typescript
// In tagger.ts, replace pushToDataLayer method:
function pushToDataLayer(eventObject) {
  // Replace this:
  // window.dataLayer.push(dataLayerEvent);
  
  // With this:
  mixpanel.track('click_event', eventObject);
}
```

**For Custom Endpoint:**
```typescript
// In tagger.ts, replace pushToDataLayer method:
function pushToDataLayer(eventObject) {
  // Replace this:
  // window.dataLayer.push(dataLayerEvent);
  
  // With this:
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventObject)
  });
}
```

**For Vanilla.js snippet:**
The same pattern applies - just replace the `pushToDataLayer` function with your preferred analytics call.

### What Gets Sent

Each click event includes:
- `action`: What was clicked (button text, link text, etc.)
- `context`: Where it was clicked (header, footer, main-content, etc.)
- `type`: Type of element (button, link, checkbox, etc.)
- `value`: Numeric value (for forms, dropdowns, etc.)
- `timestamp`: When it happened

Performance events (TypeScript version only) include:
- `init_time_ms`: How long initialization took
- `total_elements_tagged`: Number of elements processed
- `total_page_memory_mb`: Memory usage at initialization

## Development

```bash
npm run dev      # Watch mode compilation
npm run test     # Run unit tests
npm run test:e2e # Run E2E tests
```

## Testing

This project uses **Jest** and **jsdom** for unit testing the core DOM tagging logic.

### Running Unit Tests

1. **Install dev dependencies** (if you haven't already):
   ```bash
   npm install
   ```

2. **Run the tests:**
   ```bash
   npm run test
   ```
   (Or use `npx jest` to run Jest directly.)

### Test Environment

- Unit tests are located in `src/tests/unit/`.
- The test environment uses [jsdom](https://github.com/jsdom/jsdom) to simulate a browser DOM in Node.js.
- Key dev dependencies for testing:
  - `jest`
  - `ts-jest`
  - `jsdom`
  - `jest-environment-jsdom`
  - `@types/jest`
  - `@types/jsdom`
- **Polyfill for TextEncoder/TextDecoder:**
  - The file `jest.setup.js` is included and referenced in `jest.config.js` via the `setupFiles` option.
  - This ensures `TextEncoder` and `TextDecoder` are available globally before any test or import runs, which is required for compatibility with jsdom and some Node.js/Jest versions.
  - The setup file uses `require` (not `import`) for maximum compatibility, as Jest setup files are executed as CommonJS modules.

> **Note:**
> Do not remove or rename `jest.setup.js` or its reference in `jest.config.js`. This is required for tests to run reliably in all environments.

## Next Steps
- **Core functionality:** Working
- **Unit tests:** Working
- **E2E tests:** To be created
- **MCP integration:** Optional future enhancement 

## Vanilla.js Snippet (Production Ready)

The snippet below provides the core functionality without performance tracking. For enterprise applications with performance monitoring, use the TypeScript library above.

**What's included:**
- Automatic element tagging
- Click event capture
- Analytics data extraction
- Cross-browser compatibility
- Error handling

**What's not included (TypeScript version only):**
- Performance metrics
- Memory usage tracking
- Advanced error recovery
- Comprehensive testing

**Customization:**
To use with non-GTM analytics platforms, replace the `pushToDataLayer` function with your preferred analytics call (Segment, Mixpanel, custom endpoint, etc.).

```html
<script>
(function () {
  // Configurable selectors and attribute names
  var selectors = [
    "a", "button", "span", "input", "select", "textarea",
    "div[role='switch']", "div[role='slider']", "div[role='option']"
  ];
  var attributes = {
    type: "data-type",
    action: "data-action",
    context: "data-context",
    value: "data-value"
  };

  function isValidNumber(value) {
    var trimmed = (value || '').replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    return trimmed !== '' && !isNaN(parseFloat(trimmed));
  }

  function determineType(element) {
    var tag = element.tagName.toLowerCase();
    if (tag === 'input') {
      var inputType = element.getAttribute('type') || '';
      if (inputType === 'checkbox') return 'checkbox';
      if (inputType === 'radio') return 'radio-button';
      if (inputType === 'text') return 'text-input';
      if (inputType === 'number') return 'stepper';
      if (inputType === 'range') return 'slider';
      if (inputType === 'file') return 'file-upload';
      return 'input';
    }
    if (tag === 'select') return 'dropdown';
    if (tag === 'textarea') return 'textarea';
    var role = element.getAttribute('role');
    if (role === 'switch') return 'switch';
    if (role === 'slider') return 'slider';
    var classList = (element.className || '').toLowerCase();
    if (classList.indexOf('quantity') !== -1) return 'stepper';
    if (classList.indexOf('toggle') !== -1) return 'toggle';
    if (tag === 'a') return 'link';
    if (tag === 'button') return 'button';
    if (tag === 'span') return 'span';
    return tag;
  }

  // --- Location-aware context detection (absolute page position) ---
  function determineContext(element) {
    var current = element;
    var context = null;
    while (current && current !== document.body) {
      var parent = current.parentElement;
      if (!parent) break;
      var parentTag = parent.tagName.toLowerCase();
      if (parentTag === 'header') { context = 'header'; break; }
      if (parentTag === 'footer') { context = 'footer'; break; }
      if (parentTag === 'nav') { context = 'navigation'; break; }
      if (parentTag === 'aside') { context = 'sidebar'; break; }
      var classes = (parent.className || '').toLowerCase();
      if (classes.indexOf('footer') !== -1) { context = 'footer'; break; }
      if (classes.indexOf('hero') !== -1) { context = 'hero'; break; }
      if (classes.indexOf('header') !== -1) { context = 'header'; break; }
      if (classes.indexOf('sidebar') !== -1) { context = 'sidebar'; break; }
      if (classes.indexOf('nav') !== -1) { context = 'navigation'; break; }
      var heading = parent.querySelector && parent.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading && heading.textContent) {
        context = heading.textContent.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '').toLowerCase().replace(/\s+/g, '-');
        break;
      }
      current = parent;
    }
    // Location-aware adjustment for hero/header/footer (absolute page position)
    if (context === 'hero' || context === 'header' || context === 'footer') {
      var rect = element.getBoundingClientRect();
      var absoluteTop = rect.top + window.pageYOffset;
      var absoluteBottom = rect.bottom + window.pageYOffset;
      var pageHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );
      // Only call hero/header if near the top (top 25% of page)
      if ((context === 'hero' || context === 'header') && absoluteTop > pageHeight * 0.25) {
        context = null;
      }
      // Only call footer if near the bottom (bottom 25% of page)
      if (context === 'footer' && (absoluteBottom < pageHeight * 0.75)) {
        context = null;
      }
    }
    if (!context) {
      context = 'main-content';
    }
    return context;
  }
  // --- End location-aware context detection ---

  function determineAction(element) {
    if (element.tagName.toLowerCase() === 'select') {
      var select = element;
      var selectedOption = select.selectedOptions && select.selectedOptions[0];
      if (selectedOption && selectedOption.textContent) {
        return selectedOption.textContent.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
      }
    }
    var ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')) return ariaLabel.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    var text = element.textContent && element.textContent.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    if (text) return text;
    var title = element.getAttribute('title');
    if (title && title.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')) return title.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    var type = element.tagName.toLowerCase();
    return type + '-element';
  }

  function determineValue(element) {
    var tag = element.tagName.toLowerCase();
    var inputType = element.getAttribute('type') || '';
    if (tag === 'input' && inputType === 'number') {
      var value = element.value;
      return isValidNumber(value) ? value.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '') : null;
    }
    if (tag === 'select') {
      var select = element;
      var options = [];
      for (var i = 0; i < select.options.length; i++) options.push(select.options[i]);
      var allNumeric = true;
      for (var j = 0; j < options.length; j++) {
        if (options[j].value !== '' && !isValidNumber(options[j].value)) {
          allNumeric = false;
          break;
        }
      }
      if (allNumeric && select.value && isValidNumber(select.value)) {
        return select.value.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
      }
    }
    if (tag === 'li') {
      var parent = element.parentElement;
      if (parent && parent.tagName.toLowerCase() === 'ul' && parent.getAttribute('role') === 'presentation') {
        var isSelected = element.getAttribute('aria-selected') === 'true' ||
          (element.className && (element.className.indexOf('selected') !== -1 || element.className.indexOf('active') !== -1));
        if (isSelected) {
          var dataValue = element.getAttribute('data-value');
          if (dataValue && isValidNumber(dataValue)) {
            return dataValue.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
          }
        }
      }
    }
    if ((tag === 'div' || tag === 'span') && element.getAttribute('role') === 'option') {
      var isSelected2 = element.getAttribute('aria-selected') === 'true' ||
        (element.className && (element.className.indexOf('selected') !== -1 || element.className.indexOf('active') !== -1));
      if (isSelected2) {
        var textContent = element.textContent && element.textContent.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        if (textContent && isValidNumber(textContent)) {
          return textContent;
        }
      }
    }
    return null;
  }

  function tagElement(element) {
    if (
      element.hasAttribute(attributes.type) &&
      element.hasAttribute(attributes.action) &&
      element.hasAttribute(attributes.context)
    ) {
      return;
    }
    var type = determineType(element);
    var action = determineAction(element);
    var context = determineContext(element);
    var value = determineValue(element);

    if (!element.hasAttribute(attributes.type)) {
      element.setAttribute(attributes.type, type);
    }
    if (!element.hasAttribute(attributes.action)) {
      element.setAttribute(attributes.action, action);
    }
    if (!element.hasAttribute(attributes.context)) {
      element.setAttribute(attributes.context, context);
    }
    if (value !== null && !element.hasAttribute(attributes.value)) {
      element.setAttribute(attributes.value, value);
    }
  }

  // --- NEW: Change event handling for dynamic updates ---
  function updateSelectAction(selectElement) {
    var selectedOption = selectElement.selectedOptions && selectElement.selectedOptions[0];
    if (selectedOption && selectedOption.textContent) {
      var newAction = selectedOption.textContent.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
      selectElement.setAttribute(attributes.action, newAction);
    }
  }

  function updateNumberInputValue(inputElement) {
    var value = (inputElement.value || '').replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    if (value !== '') {
      inputElement.setAttribute(attributes.value, value);
    }
  }

  function handleChange(event) {
    var target = event.target;
    
    // Handle select elements
    if (target.tagName.toLowerCase() === 'select') {
      updateSelectAction(target);
    }
    
    // Handle number inputs (steppers)
    if (target.tagName.toLowerCase() === 'input' && target.getAttribute('type') === 'number') {
      updateNumberInputValue(target);
    }
  }

  // --- NEW: Click event handling with analytics data extraction ---
  function extractAndPushAnalytics(clickedElement) {
    var maxTraversalDepth = 10;
    var currentDepth = 0;
    var currentNode = clickedElement;
    var eventObject = {};
    var hasAnalyticsData = false;
    
    // Traverse up the DOM tree looking for data attributes
    while (currentDepth < maxTraversalDepth && currentNode) {
      // Check if current node has analytics attributes
      if (currentNode.nodeType === 1) { // Element node
        var element = currentNode;
        
        // Check for data-action and data-context (primary attributes)
        var action = element.getAttribute('data-action');
        var context = element.getAttribute('data-context');
        var type = element.getAttribute('data-type');
        var value = element.getAttribute('data-value');
        
        if (action || context) {
          if (action) eventObject.action = action;
          if (context) eventObject.context = context;
          hasAnalyticsData = true;
        }
        
        // Also check for data-type and data-value (secondary attributes)
        if (type) eventObject.type = type;
        if (value) eventObject.value = value;
      }
      
      // Move to parent node
      currentNode = currentNode.parentNode;
      currentDepth++;
    }
    
    // Push to data layer if we found analytics data
    if (hasAnalyticsData) {
      pushToDataLayer(eventObject);
    }
  }

  function pushToDataLayer(eventObject) {
    window.dataLayer = window.dataLayer || [];
    
    var dataLayerEvent = {
      event: 'click_event',
      click_object: eventObject,
      timestamp: Date.now()
    };
    
    window.dataLayer.push(dataLayerEvent);
  }

  function handleClick(event) {
    var target = event.target;
    
    // Tag the clicked element if it matches our selectors
    var matchesSelector = false;
    for (var i = 0; i < selectors.length; i++) {
      if (target.matches && target.matches(selectors[i])) {
        matchesSelector = true;
        break;
      }
    }
    
    if (matchesSelector) {
      tagElement(target);
    }
    
    // Extract analytics data and push to data layer
    extractAndPushAnalytics(target);
  }

  // --- Event listener setup ---
  function setupEventListeners() {
    // Click listener for dynamic element tagging and analytics
    document.addEventListener('click', handleClick, true); // Use capture phase
    
    // Change listener for dynamic updates
    document.addEventListener('change', handleChange, true); // Use capture phase
  }

  // --- Initialize ---
  function init() {
    // Tag all existing elements
    var nodeList = document.querySelectorAll(selectors.join(','));
    for (var i = 0; i < nodeList.length; i++) {
      var el = nodeList[i];
      if (el && el.nodeType === 1) tagElement(el);
    }

    // Set up event listeners
    setupEventListeners();

    if (window.console && window.console.log) {
      window.console.log('[DOM Tagger] Tagged ' + nodeList.length + ' elements and set up event listeners.');
    }
  }

  // Start the tagging process
  init();
})();
</script>
