import crypto from 'crypto';

export class ChangeDetector {
  constructor() {
    this.threshold = 0.05;
  }

  detectChanges(oldData, newData) {
    const changes = {
      detected: false,
      timestamp: new Date().toISOString(),
      changes: []
    };

    if (oldData.metadata?.title !== newData.metadata?.title) {
      changes.changes.push({
        type: 'metadata',
        field: 'title',
        old: oldData.metadata?.title,
        new: newData.metadata?.title
      });
      changes.detected = true;
    }

    if (oldData.metadata?.description !== newData.metadata?.description) {
      changes.changes.push({
        type: 'metadata',
        field: 'description',
        old: oldData.metadata?.description,
        new: newData.metadata?.description
      });
      changes.detected = true;
    }

    const contentChange = this.detectContentChange(
      oldData.content?.text || '',
      newData.content?.text || ''
    );
    
    if (contentChange.changed) {
      changes.changes.push({
        type: 'content',
        field: 'text',
        similarity: contentChange.similarity,
        changePercentage: contentChange.changePercentage
      });
      changes.detected = true;
    }

    const structureChanges = this.detectStructureChanges(oldData, newData);
    if (structureChanges.length > 0) {
      changes.changes.push(...structureChanges);
      changes.detected = true;
    }

    const linkChanges = this.detectLinkChanges(
      oldData.links || [],
      newData.links || []
    );
    
    if (linkChanges.added.length > 0 || linkChanges.removed.length > 0) {
      changes.changes.push({
        type: 'links',
        added: linkChanges.added.length,
        removed: linkChanges.removed.length,
        addedLinks: linkChanges.added.slice(0, 10),
        removedLinks: linkChanges.removed.slice(0, 10)
      });
      changes.detected = true;
    }

    const imageChanges = this.detectImageChanges(
      oldData.images || [],
      newData.images || []
    );
    
    if (imageChanges.added.length > 0 || imageChanges.removed.length > 0) {
      changes.changes.push({
        type: 'images',
        added: imageChanges.added.length,
        removed: imageChanges.removed.length
      });
      changes.detected = true;
    }

    changes.summary = this.generateSummary(changes.changes);

    return changes;
  }

  detectContentChange(oldText, newText) {
    if (oldText === newText) {
      return { changed: false, similarity: 1, changePercentage: 0 };
    }

    const similarity = this.calculateSimilarity(oldText, newText);
    const changePercentage = (1 - similarity) * 100;

    return {
      changed: similarity < (1 - this.threshold),
      similarity,
      changePercentage
    };
  }

  calculateSimilarity(str1, str2) {
    if (str1 === str2) return 1;
    if (!str1 || !str2) return 0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  detectStructureChanges(oldData, newData) {
    const changes = [];

    const oldHeadings = oldData.content?.headings || {};
    const newHeadings = newData.content?.headings || {};

    for (const level of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) {
      const oldCount = (oldHeadings[level] || []).length;
      const newCount = (newHeadings[level] || []).length;

      if (oldCount !== newCount) {
        changes.push({
          type: 'structure',
          field: level,
          old: oldCount,
          new: newCount,
          change: newCount - oldCount
        });
      }
    }

    return changes;
  }

  detectLinkChanges(oldLinks, newLinks) {
    const oldHrefs = new Set(oldLinks.map(l => l.href).filter(Boolean));
    const newHrefs = new Set(newLinks.map(l => l.href).filter(Boolean));

    const added = [...newHrefs].filter(href => !oldHrefs.has(href));
    const removed = [...oldHrefs].filter(href => !newHrefs.has(href));

    return { added, removed };
  }

  detectImageChanges(oldImages, newImages) {
    const oldSrcs = new Set(oldImages.map(img => img.src).filter(Boolean));
    const newSrcs = new Set(newImages.map(img => img.src).filter(Boolean));

    const added = [...newSrcs].filter(src => !oldSrcs.has(src));
    const removed = [...oldSrcs].filter(src => !newSrcs.has(src));

    return { added, removed };
  }

  generateSummary(changes) {
    const summary = {
      total: changes.length,
      byType: {}
    };

    for (const change of changes) {
      if (!summary.byType[change.type]) {
        summary.byType[change.type] = 0;
      }
      summary.byType[change.type]++;
    }

    return summary;
  }

  compareScreenshots(oldScreenshot, newScreenshot) {
    if (!oldScreenshot || !newScreenshot) {
      return { compared: false, reason: 'Missing screenshot data' };
    }

    const oldHash = this.hashBuffer(oldScreenshot);
    const newHash = this.hashBuffer(newScreenshot);

    return {
      compared: true,
      identical: oldHash === newHash,
      oldHash,
      newHash
    };
  }

  hashBuffer(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  hashContent(content) {
    return crypto.createHash('md5').update(String(content)).digest('hex');
  }
}
