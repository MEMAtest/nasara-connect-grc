/**
 * Liquid Template Renderer
 * Renders Markdown with Liquid variables using a simple template engine
 */

/**
 * Simple Liquid-style template renderer
 * Supports:
 * - Variable interpolation: {{ variable_name }}
 * - Conditionals: {% if condition %}...{% endif %}
 * - Loops: {% for item in array %}...{% endfor %}
 */
export function renderLiquidTemplate(
  template: string,
  context: Record<string, any>
): string {
  let output = template;

  // Process conditionals: {% if variable %}...{% endif %}
  output = output.replace(
    /{%\s*if\s+(\w+)\s*%}([\s\S]*?){%\s*endif\s*%}/g,
    (match, variable, content) => {
      const value = context[variable];
      // Truthy check
      if (value) {
        return content;
      }
      return '';
    }
  );

  // Process negation conditionals: {% unless variable %}...{% endunless %}
  output = output.replace(
    /{%\s*unless\s+(\w+)\s*%}([\s\S]*?){%\s*endunless\s*%}/g,
    (match, variable, content) => {
      const value = context[variable];
      // Falsy check
      if (!value) {
        return content;
      }
      return '';
    }
  );

  // Process loops: {% for item in items %}...{% endfor %}
  output = output.replace(
    /{%\s*for\s+(\w+)\s+in\s+(\w+)\s*%}([\s\S]*?){%\s*endfor\s*%}/g,
    (match, itemName, arrayName, content) => {
      const array = context[arrayName];
      if (!Array.isArray(array)) {
        return '';
      }

      return array
        .map((item) => {
          // Create a new context with the loop item
          const loopContext = { ...context, [itemName]: item };
          // Recursively render the content
          return renderLiquidTemplate(content, loopContext);
        })
        .join('');
    }
  );

  // Process variable interpolation: {{ variable_name }}
  output = output.replace(/{{\s*(\w+(?:\.\w+)*)\s*}}/g, (match, path) => {
    // Support nested properties: {{ firm.name }}
    const parts = path.split('.');
    let value: any = context;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
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
  variables: Record<string, any>,
  answers: Record<string, any>
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
