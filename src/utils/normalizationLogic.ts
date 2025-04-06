export interface FunctionalDependency {
  determinant: string[]; // Left-hand side attributes
  dependent: string[]; // Right-hand side attributes
}

export interface NormalizationStep {
  name: string; // e.g., "1NF", "2NF", etc.
  relations: string[]; // Relations at this step
  violatingDependencies?: FunctionalDependency[]; // Dependencies that violate this normal form
  decomposedRelations?: string[]; // Relations after decomposition
  reasoning: string; // Explanation of this step
}

export interface NormalizationResult {
  steps: NormalizationStep[];
  finalRelations: string[];
}

// Parse relation schema string into array of attributes
const parseSchema = (schema: string): string[] => {
  // Extract attributes from R(A, B, C, D) format
  const match = schema.match(/\(([^)]+)\)/);
  if (!match) return [];
  
  return match[1].split(',').map(attr => attr.trim());
};

// Parse functional dependencies string into structured format
const parseFDs = (fdString: string): FunctionalDependency[] => {
  if (!fdString) return [];
  
  return fdString.split(',').map(fd => {
    // Handle both arrow formats: → and ->
    const parts = fd.trim().split(/→|->|>/);
    if (parts.length !== 2) return { determinant: [], dependent: [] };
    
    const determinant = parts[0].trim().split('').filter(char => /[A-Z]/i.test(char));
    const dependent = parts[1].trim().split('').filter(char => /[A-Z]/i.test(char));
    
    return { determinant, dependent };
  }).filter(fd => fd.determinant.length > 0 && fd.dependent.length > 0);
};

// Parse candidate keys string into array of candidate keys
const parseKeys = (keysString: string): string[][] => {
  if (!keysString) return [];
  
  return keysString.split(',').map(key => 
    key.trim().split('').filter(char => /[A-Z]/i.test(char))
  ).filter(key => key.length > 0);
};

// Check if a set of attributes is a subset of another
const isSubset = (subset: string[], superset: string[]): boolean => {
  return subset.every(attr => superset.includes(attr));
};

// Compute the closure of a set of attributes under a set of FDs
const computeClosure = (attrs: string[], fds: FunctionalDependency[]): string[] => {
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
};

// Find all candidate keys for a relation
const findCandidateKeys = (
  attributes: string[], 
  fds: FunctionalDependency[], 
  providedKeys: string[][] = []
): string[][] => {
  if (providedKeys.length > 0) return providedKeys;
  
  // Start with superkey (all attributes)
  const allAttrs = [...attributes];
  const candidateKeys: string[][] = [];
  
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
};

// Identify partial dependencies for 2NF
const findPartialDependencies = (
  attributes: string[], 
  candidateKeys: string[][], 
  fds: FunctionalDependency[]
): FunctionalDependency[] => {
  const partialDeps: FunctionalDependency[] = [];
  
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
};

// Identify transitive dependencies for 3NF
const findTransitiveDependencies = (
  attributes: string[], 
  candidateKeys: string[][], 
  fds: FunctionalDependency[]
) => {
  const transitiveDeps: FunctionalDependency[] = [];
  const primeAttrs = new Set<string>();
  
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
};

// Identify BCNF violations
const findBCNFViolations = (
  attributes: string[], 
  candidateKeys: string[][], 
  fds: FunctionalDependency[]
): FunctionalDependency[] => {
  const violations: FunctionalDependency[] = [];
  
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
};

// Generate explanations for each normalization step
const generateExplanation = (
  step: string, 
  attributes: string[], 
  violatingDeps: FunctionalDependency[]
): string => {
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
};

// Function to normalize a relation to BCNF
export const normalize = (
  schema: string,
  fdString: string,
  keysString: string = ""
): NormalizationResult => {
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
  const result: NormalizationResult = {
    steps: [],
    finalRelations: []
  };
  
  // Step 1: 1NF (assume already in 1NF for simplicity)
  const step1: NormalizationStep = {
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
  
  const step2: NormalizationStep = {
    name: '2NF',
    relations: currentRelations,
    violatingDependencies: partialDeps,
    reasoning: generateExplanation('2NF', attributes, partialDeps)
  };
  
  if (partialDeps.length > 0) {
    const decomposedRelations = [];
    // Handle decomposition for 2NF
    // This is simplified - in a real implementation, you'd create proper decompositions
    for (const dep of partialDeps) {
      const newRel = `R_${dep.determinant.join('')}(${[...dep.determinant, ...dep.dependent].join(', ')})`;
      decomposedRelations.push(newRel);
    }
    
    // Create a relation for the remaining attributes
    const usedAttrs = new Set<string>();
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
  
  const step3: NormalizationStep = {
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
    step3.decomposedRelations = Array.from(new Set(decomposedRelations));
    currentRelations = step3.decomposedRelations;
  }
  
  result.steps.push(step3);
  
  // Step 4: BCNF
  const bcnfViolations = findBCNFViolations(attributes, candidateKeys, fds);
  
  const step4: NormalizationStep = {
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
    step4.decomposedRelations = Array.from(new Set(decomposedRelations));
    currentRelations = step4.decomposedRelations;
  }
  
  result.steps.push(step4);
  result.finalRelations = currentRelations;
  
  return result;
};
