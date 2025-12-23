export class UpdateSystemConfigCommand {
  constructor(public readonly updates: Record<string, unknown>) {}
}
