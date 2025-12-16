import { ValueObject } from '@shared/domain/value-object.base';

interface SlugProps {
  value: string;
}

export class Slug extends ValueObject<SlugProps> {
  private constructor(props: SlugProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(slug: string): Slug {
    const normalized = Slug.normalize(slug);
    if (!Slug.isValid(normalized)) {
      throw new Error(`Invalid slug: ${slug}`);
    }
    return new Slug({ value: normalized });
  }

  static fromTitle(title: string): Slug {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove consecutive hyphens
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

    return new Slug({ value: slug });
  }

  private static normalize(slug: string): string {
    return slug
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private static isValid(slug: string): boolean {
    // Slug must be lowercase, alphanumeric with hyphens, min 3 chars
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug) && slug.length >= 3;
  }
}
