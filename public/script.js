
document.addEventListener('DOMContentLoaded', function() {
  // Get the form and other elements
  const form = document.getElementById('normalization-form');
  const copyBtn = document.getElementById('copy-btn');
  const resultsContent = document.getElementById('results-content');
  const errorMessage = document.getElementById('error-message');
  
  // State
  let normalizationResult = null;
  
  // Add event listeners
  form.addEventListener('submit', handleSubmit);
  copyBtn.addEventListener('click', copyResults);
  
  // Parse schema string into array of attributes
  function parseSchema(schema) {
    // Extract attributes from R(A, B, C, D) format
    const match = schema.match(/\(([^)]+)\)/);
    if (!match) return [];
    
    return match[1].split(',').map(attr => attr.trim());
  }
  
  // Parse functional dependencies string into structured format
  function parseFDs(fdString) {
    if (!fdString) return [];
    
    return fdString.split(',').map(fd => {
      // Handle both arrow formats: → and ->
      const parts = fd.trim().split(/→|->|>/);
      if (parts.length !== 2) return { determinant: [], dependent: [] };
      
      const determinant = parts[0].trim().split('').filter(char => /[A-Z]/i.test(char));
      const dependent = parts[1].trim().split('').filter(char => /[A-Z]/i.test(char));
      
      return { determinant, dependent };
    }).filter(fd => fd.determinant.length > 0 && fd.dependent.length > 0);
  }
  
  // Parse candidate keys string into array of candidate keys
  function parseKeys(keysString) {
    if (!keysString) return [];
    
    return keysString.split(',').map(key => 
      key.trim().split('').filter(char => /[A-Z]/i.test(char))
    ).filter(key => key.length > 0);
  }
  
  // Check if a set of attributes is a subset of another
  function isSubset(subset, superset) {
    return subset.every(attr => superset.includes(attr));
  }
  
  // Compute the closure of a set of attributes under a set of FDs
  function computeClosure(attrs, fds) {
    let closure = [...attrs];
    let changed = true;
    
    while (changed) {
      changed = false;
      
      for (const fd of fds) {
        if (isSubset(fd.determinant, closure) && !fd.dependent.every(attr => closure.includes(attr))) {
          fd.dependent.forEach(attr => {
            if (!closure.includes(attr)) {
              closure.push(attr);
              changed = true;
            }
          });
        }
      }
    }
    
    return closure;
  }
  
  // Find all candidate keys for a relation
  function findCandidateKeys(attributes, fds, providedKeys = []) {
    if (providedKeys.length > 0) return providedKeys;
    
    // Start with superkey (all attributes)
    const allAttrs = [...attributes];
    const candidateKeys = [];
    
    // Try to reduce the superkey by removing attributes
    for (let i = 0; i < allAttrs.length; i++) {
      const potentialKey = allAttrs.filter((_, index) => index !== i);
      const closure = computeClosure(potentialKey, fds);
      
      if (attributes.every(attr => closure.includes(attr))) {
        // If the closure contains all attributes, this is a candidate key
        candidateKeys.push(potentialKey);
      }
    }
    
    // If no candidate keys found, the superkey is the only candidate key
    if (candidateKeys.length === 0) {
      return [allAttrs];
    }
    
    return candidateKeys;
  }
  
  // Identify partial dependencies for 2NF
  function findPartialDependencies(attributes, candidateKeys, fds) {
    const partialDeps = [];
    
    for (const fd of fds) {
      // Check if the determinant is a proper subset of any candidate key
      for (const key of candidateKeys) {
        if (
          fd.determinant.every(attr => key.includes(attr)) && // Determinant is a subset of the key
          fd.determinant.length < key.length && // Determinant is a proper subset
          !fd.dependent.every(attr => key.includes(attr)) // Dependent contains non-prime attribute
        ) {
          partialDeps.push(fd);
          break;
        }
      }
    }
    
    return partialDeps;
  }
  
  // Identify transitive dependencies for 3NF
  function findTransitiveDependencies(attributes, candidateKeys, fds) {
    const transitiveDeps = [];
    const primeAttrs = new Set();
    
    // Collect all prime attributes (attributes that are part of any candidate key)
    candidateKeys.forEach(key => {
      key.forEach(attr => primeAttrs.add(attr));
    });
    
    for (const fd1 of fds) {
      // Check if the determinant is not a superkey and doesn't contain a key
      if (!fd1.determinant.some(attr => primeAttrs.has(attr))) {
        continue;
      }
      
      // Check if any of the determinant's dependents can determine other attributes
      for (const fd2 of fds) {
        if (
          fd1 !== fd2 && // Not the same FD
          isSubset(fd2.determinant, fd1.dependent) && // fd1's dependent determines fd2's dependent
          !isSubset(fd2.dependent, fd1.dependent) && // fd2's dependent is not already in fd1's dependent
          !fd2.dependent.every(attr => primeAttrs.has(attr)) // fd2's dependent has non-prime attribute
        ) {
          transitiveDeps.push(fd2);
        }
      }
    }
    
    return transitiveDeps;
  }
  
  // Identify BCNF violations
  function findBCNFViolations(attributes, candidateKeys, fds) {
    const violations = [];
    
    for (const fd of fds) {
      // Compute closure of the determinant
      const closure = computeClosure(fd.determinant, fds);
      
      // Check if the determinant is a superkey
      const isSuperkey = attributes.every(attr => closure.includes(attr));
      
      // If not a superkey, it violates BCNF
      if (!isSuperkey) {
        violations.push(fd);
      }
    }
    
    return violations;
  }
  
  // Generate explanations for each normalization step
  function generateExplanation(step, attributes, violatingDeps) {
    switch (step) {
      case '1NF':
        return "First Normal Form (1NF) requires that each attribute contains only atomic (indivisible) values " +
               "and there are no repeating groups. For this step, we assume the initial relation satisfies 1NF.";
      
      case '2NF':
        if (violatingDeps.length === 0) {
          return "The relation is already in 2NF as there are no partial dependencies.";
        }
        return "To achieve Second Normal Form (2NF), we need to remove partial dependencies " +
               "by decomposing the relation. Partial dependencies occur when a non-prime attribute " +
               "depends on part of a candidate key.";
        
      case '3NF':
        if (violatingDeps.length === 0) {
          return "The relation is already in 3NF as there are no transitive dependencies.";
        }
        return "To achieve Third Normal Form (3NF), we need to remove transitive dependencies. " +
               "Transitive dependencies occur when a non-prime attribute depends on another non-prime attribute.";
        
      case 'BCNF':
        if (violatingDeps.length === 0) {
          return "The relation is already in BCNF as all determinants are superkeys.";
        }
        return "To achieve Boyce-Codd Normal Form (BCNF), every determinant must be a superkey. " +
               "We need to decompose relations where this is not the case.";
        
      default:
        return "";
    }
  }
  
  // Function to normalize a relation to BCNF
  function normalize(schema, fdString, keysString = "") {
    // Parse inputs
    const attributes = parseSchema(schema);
    const fds = parseFDs(fdString);
    const providedKeys = parseKeys(keysString);
    
    // Validate inputs
    if (attributes.length === 0) {
      return { 
        steps: [{
          name: 'Error',
          relations: [],
          reasoning: 'Invalid schema format. Please use the format R(A, B, C, D).'
        }],
        finalRelations: []
      };
    }
    
    if (fds.length === 0) {
      return { 
        steps: [{
          name: 'Error',
          relations: [],
          reasoning: 'No valid functional dependencies provided. Please use the format A→B, BC→D or A->B, BC->D.'
        }],
        finalRelations: []
      };
    }
    
    // Initialize result
    const result = {
      steps: [],
      finalRelations: []
    };
    
    // Step 1: 1NF (assume already in 1NF for simplicity)
    const step1 = {
      name: '1NF',
      relations: [`R(${attributes.join(', ')})`],
      reasoning: generateExplanation('1NF', attributes, [])
    };
    result.steps.push(step1);
    
    // Find candidate keys
    const candidateKeys = findCandidateKeys(attributes, fds, providedKeys);
    
    // Step 2: 2NF
    const partialDeps = findPartialDependencies(attributes, candidateKeys, fds);
    let currentRelations = [...step1.relations];
    
    const step2 = {
      name: '2NF',
      relations: currentRelations,
      violatingDependencies: partialDeps,
      reasoning: generateExplanation('2NF', attributes, partialDeps)
    };
    
    if (partialDeps.length > 0) {
      const decomposedRelations = [];
      // Handle decomposition for 2NF
      for (const dep of partialDeps) {
        const newRel = `R_${dep.determinant.join('')}(${[...dep.determinant, ...dep.dependent].join(', ')})`;
        decomposedRelations.push(newRel);
      }
      
      // Create a relation for the remaining attributes
      const usedAttrs = new Set();
      partialDeps.forEach(dep => {
        [...dep.determinant, ...dep.dependent].forEach(attr => usedAttrs.add(attr));
      });
      
      // Include any candidate key in the remaining relation
      const remainingAttrs = attributes.filter(attr => !usedAttrs.has(attr));
      if (remainingAttrs.length > 0) {
        const key = candidateKeys[0]; // Use first candidate key for simplicity
        const remainingRel = `R_main(${[...new Set([...key, ...remainingAttrs])].join(', ')})`;
        decomposedRelations.push(remainingRel);
      }
      
      step2.decomposedRelations = decomposedRelations;
      currentRelations = decomposedRelations;
    }
    
    result.steps.push(step2);
    
    // Step 3: 3NF
    const transitiveDeps = findTransitiveDependencies(attributes, candidateKeys, fds);
    
    const step3 = {
      name: '3NF',
      relations: currentRelations,
      violatingDependencies: transitiveDeps,
      reasoning: generateExplanation('3NF', attributes, transitiveDeps)
    };
    
    if (transitiveDeps.length > 0) {
      const decomposedRelations = [];
      // Handle decomposition for 3NF
      for (const dep of transitiveDeps) {
        const newRel = `R_${dep.determinant.join('')}(${[...dep.determinant, ...dep.dependent].join(', ')})`;
        decomposedRelations.push(newRel);
      }
      
      // Create relations for remaining FDs
      const remainingFDs = fds.filter(fd => !transitiveDeps.includes(fd));
      for (const fd of remainingFDs) {
        const newRel = `R_${fd.determinant.join('')}(${[...fd.determinant, ...fd.dependent].join(', ')})`;
        decomposedRelations.push(newRel);
      }
      
      // Deduplicate relations
      step3.decomposedRelations = [...new Set(decomposedRelations)];
      currentRelations = step3.decomposedRelations;
    }
    
    result.steps.push(step3);
    
    // Step 4: BCNF
    const bcnfViolations = findBCNFViolations(attributes, candidateKeys, fds);
    
    const step4 = {
      name: 'BCNF',
      relations: currentRelations,
      violatingDependencies: bcnfViolations,
      reasoning: generateExplanation('BCNF', attributes, bcnfViolations)
    };
    
    if (bcnfViolations.length > 0) {
      const decomposedRelations = [];
      // Handle decomposition for BCNF
      for (const violation of bcnfViolations) {
        const newRel1 = `R_${violation.determinant.join('')}(${[...violation.determinant, ...violation.dependent].join(', ')})`;
        
        // Create a relation for attributes not dependent on this determinant
        const closure = computeClosure(violation.determinant, fds);
        const notDependentAttrs = attributes.filter(attr => !closure.includes(attr) || violation.determinant.includes(attr));
        
        if (notDependentAttrs.length > 0) {
          const newRel2 = `R_rest(${notDependentAttrs.join(', ')})`;
          decomposedRelations.push(newRel2);
        }
        
        decomposedRelations.push(newRel1);
      }
      
      // Deduplicate relations
      step4.decomposedRelations = [...new Set(decomposedRelations)];
      currentRelations = step4.decomposedRelations;
    }
    
    result.steps.push(step4);
    result.finalRelations = currentRelations;
    
    return result;
  }
  
  function handleSubmit(e) {
    e.preventDefault();
    
    // Clear previous error
    errorMessage.classList.add('hidden');
    errorMessage.innerHTML = '';
    
    // Get form values
    const schema = document.getElementById('schema').value.trim();
    const fds = document.getElementById('fds').value.trim();
    const candidateKeys = document.getElementById('keys').value.trim();
    
    // Validate schema format
    const schemaFormat = /^[A-Za-z_]+\([A-Za-z_,\s]+\)$/;
    if (!schemaFormat.test(schema)) {
      showError('Please enter a valid relation schema in the format R(A, B, C, D)');
      return;
    }
    
    // Validate functional dependencies
    if (!fds) {
      showError('Please enter at least one functional dependency');
      return;
    }
    
    try {
      // Perform normalization
      normalizationResult = normalize(schema, fds, candidateKeys);
      
      // Check if there was an error
      if (normalizationResult.steps.length > 0 && normalizationResult.steps[0].name === 'Error') {
        showError(normalizationResult.steps[0].reasoning);
        return;
      }
      
      // Display results
      displayResults(normalizationResult);
      
      // Show the copy button
      copyBtn.style.display = 'block';
      
    } catch (err) {
      showError(`Error during normalization: ${err.message || 'Unknown error'}`);
    }
  }
  
  function showError(message) {
    errorMessage.classList.remove('hidden');
    errorMessage.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>${message}</span>
    `;
  }
  
  function displayResults(result) {
    let html = '';
    
    // Generate HTML for each step
    result.steps.forEach((step, index) => {
      let headerClass = '';
      switch (step.name) {
        case '1NF': headerClass = 'nf1'; break;
        case '2NF': headerClass = 'nf2'; break;
        case '3NF': headerClass = 'nf3'; break;
        case 'BCNF': headerClass = 'bcnf'; break;
      }
      
      html += `
        <div class="step-card">
          <div class="step-header ${headerClass}">
            Step ${index + 1}: ${step.name}
          </div>
          <div class="step-content">
            <div class="step-section">
              <h5>Initial Relations</h5>
              <p class="bg-light">${step.relations.join(', ')}</p>
            </div>
      `;
      
      if (step.violatingDependencies && step.violatingDependencies.length > 0) {
        html += `
          <div class="step-section">
            <h5>Violating Dependencies</h5>
            <p class="bg-red-light">
              ${step.violatingDependencies.map(fd => 
                `${fd.determinant.join('')}→${fd.dependent.join('')}`
              ).join(', ')}
            </p>
          </div>
        `;
      }
      
      if (step.decomposedRelations) {
        html += `
          <div class="step-section">
            <h5>
              Decomposed Relations
              <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" 
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </h5>
            <p class="bg-green-light">${step.decomposedRelations.join(', ')}</p>
          </div>
        `;
      }
      
      html += `
            <div class="step-section">
              <h5>Reasoning</h5>
              <p>${step.reasoning}</p>
            </div>
          </div>
        </div>
      `;
    });
    
    // Add final relations
    html += `
      <div class="final-relations">
        <h4>Final Relations</h4>
        <p>${result.finalRelations.join(', ')}</p>
      </div>
    `;
    
    // Update the results container
    resultsContent.innerHTML = html;
  }
  
  function copyResults() {
    if (!normalizationResult) return;
    
    let text = 'Normalization Results\n\n';
    
    normalizationResult.steps.forEach((step, index) => {
      text += `${step.name}:\n`;
      text += `Relations: ${step.relations.join(', ')}\n`;
      
      if (step.violatingDependencies && step.violatingDependencies.length > 0) {
        text += 'Violating Dependencies: ';
        text += step.violatingDependencies.map(fd => 
          `${fd.determinant.join('')}→${fd.dependent.join('')}`
        ).join(', ') + '\n';
      }
      
      if (step.decomposedRelations) {
        text += `Decomposed Relations: ${step.decomposedRelations.join(', ')}\n`;
      }
      
      text += `Reasoning: ${step.reasoning}\n\n`;
    });
    
    text += `Final Relations: ${normalizationResult.finalRelations.join(', ')}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(text)
      .then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2000);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  }
});
