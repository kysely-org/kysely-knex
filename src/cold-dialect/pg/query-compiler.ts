import {PostgresQueryCompiler, RawNode, type OperatorNode} from 'kysely'
import {escapeQuestionMarks, isString} from '../../util.js'

export class PGKnexQueryCompiler extends PostgresQueryCompiler {
  protected override appendImmediateValue(value: unknown): void {
    super.appendImmediateValue(
      isString(value) ? escapeQuestionMarks(value) : value,
    )
  }

  protected override getCurrentParameterPlaceholder(): string {
    return '?'
  }

  protected override visitOperator(node: OperatorNode): void {
    this.append(escapeQuestionMarks(node.operator))
  }

  protected override visitRaw(node: RawNode): void {
    super.visitRaw(
      RawNode.create(
        node.sqlFragments.map(escapeQuestionMarks),
        node.parameters,
      ),
    )
  }
}
