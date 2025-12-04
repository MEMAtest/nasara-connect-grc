/**
 * Liquid Template Renderer
 * Renders Markdown with Liquid variables using a simple template engine
 */
import type { JsonValue } from "@/lib/policies/types";

/**
 * Simple Liquid-style template renderer
 * Supports:
 * - Variable interpolation: {{ variable_name }}
 * - Conditionals: {% if condition %}...{% endif %}
 * - Loops: {% for item in array %}...{% endfor %}
 */
export function renderLiquidTemplate(
  template: string,
  context: Record<string, JsonValue>
): string {
  let output = template;
  let hasChanges = true;
  let iterations = 0;
  const maxIterations = 10; // Prevent infinite loops

  // Process templates iteratively to handle nested structures
  while (hasChanges && iterations < maxIterations) {
    hasChanges = false;
    iterations++;

    // Process conditionals: {% if variable %}...{% endif %}
    // Use non-global regex and loop to process from innermost first
    const ifMatch = /{%\s*if\s+(\w+)\s*%}([\s\S]*?){%\s*endif\s*%}/.exec(output);
    if (ifMatch) {
      const [match, variable, content] = ifMatch;
      const value = context[variable];
      // Truthy check - if true, keep content, else remove
      const replacement = value ? content : '';
      output = output.substring(0, ifMatch.index) + replacement + output.substring(ifMatch.index + match.length);
      hasChanges = true;
      continue;
    }

    // Process negation conditionals: {% unless variable %}...{% endunless %}
    const unlessMatch = /{%\s*unless\s+(\w+)\s*%}([\s\S]*?){%\s*endunless\s*%}/.exec(output);
    if (unlessMatch) {
      const [match, variable, content] = unlessMatch;
      const value = context[variable];
      // Falsy check - if false, keep content, else remove
      const replacement = !value ? content : '';
      output = output.substring(0, unlessMatch.index) + replacement + output.substring(unlessMatch.index + match.length);
      hasChanges = true;
      continue;
    }

    // Process loops: {% for item in items %}...{% endfor %}
    const forMatch = /{%\s*for\s+(\w+)\s+in\s+(\w+)\s*%}([\s\S]*?){%\s*endfor\s*%}/.exec(output);
    if (forMatch) {
      const [match, itemName, arrayName, content] = forMatch;
      const array = context[arrayName];
      let replacement = '';

      if (Array.isArray(array)) {
        replacement = array
          .map((item) => {
            // Create a new context with the loop item
            const loopContext: Record<string, JsonValue> = { ...context, [itemName]: item as JsonValue };
            // Recursively render the content
            return renderLiquidTemplate(content, loopContext);
          })
          .join('');
      }

      output = output.substring(0, forMatch.index) + replacement + output.substring(forMatch.index + match.length);
      hasChanges = true;
      continue;
    }
  }

  // Process variable interpolation: {{ variable_name }}
  output = output.replace(/{{\s*(\w+(?:\.\w+)*)\s*}}/g, (_match, path) => {
    // Support nested properties: {{ firm.name }}
    const parts = path.split('.');
    let value: JsonValue | Record<string, JsonValue> = context;

    for (const part of parts) {
      if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        part in value
      ) {
        value = (value as Record<string, JsonValue>)[part];
      } else {
        value = undefined;
        break;
      }
    }

    return value !== undefined && value !== null ? String(value) : '';
  });

  return output;
}

/**
 * Render a clause with Liquid variables
 */
export function renderClause(
  clauseBodyMd: string,
  variables: Record<string, JsonValue>,
  answers: Record<string, JsonValue>
): string {
  // Combine variables and answers into a single context
  const context = {
    ...variables,
    ...answers,
  };

  return renderLiquidTemplate(clauseBodyMd, context);
}

/**
 * Test the template renderer
 */
export function testLiquidRenderer() {
  const template = `
# Sample Policy Clause

Firm Name: {{ firm_name }}

{% if pep_domestic %}
## Enhanced Due Diligence for Domestic PEPs

This firm has identified Domestic Politically Exposed Persons (PEPs) as clients.
Enhanced due diligence procedures must be applied.

Approver: {{ approver_role }}
{% endif %}

## Client Types

The firm serves the following client types:
{% for type in client_types %}
- {{ type }}
{% endfor %}

{% unless outsourcing %}
All operations are performed in-house.
{% endunless %}
`;

  const context = {
    firm_name: 'Acme Financial Services Ltd',
    pep_domestic: true,
    approver_role: 'SMF17',
    client_types: ['retail', 'professional'],
  };

  const rendered = renderLiquidTemplate(template, context);
  console.log('Rendered template:', rendered);
  return rendered;
}
