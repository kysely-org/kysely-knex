import {MssqlQueryCompiler, RawNode} from 'kysely'
import {escapeQuestionMarks, isString} from '../../util.js'

export class MSSQLKnexQueryBuilder extends MssqlQueryCompiler {
  protected override appendImmediateValue(value: unknown): void {
    super.appendImmediateValue(
      isString(value) ? escapeQuestionMarks(value) : value,
    )
  }

  protected override getCurrentParameterPlaceholder(): string {
    return '?'
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
