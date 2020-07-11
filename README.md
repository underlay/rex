# rex

> Reduction Expressions

This is an experimental language for annotating [ShEx](https:/shex.io) shapes with _reduction expressions_. For now, shapes are limited to

[src/schema.ts](src/schema.ts) exports an [io-ts](https://github.com/gcanti/io-ts) validator for compliant schemas.

## Vocabulary

### Equivalence

The blank nodes matching a top-level shape's type class are subjected to a user-provided equivalence relation before reduction.

With no annotations, this equivalence relation is the reflexive identitfy relation (no blank nodes are joined)

#### Primary key

- `rex:key`

### Sort

#### Lexicographic

- `rex:sort rex:first`
- `rex:sort rex:last`

Valid for all terms.

#### Numeric

- `rex:sort rex:greatest`
- `rex:sort rex:least`

Valid for datatypes:

- `xsd:decimal`
- `xsd:double`
- `xsd:float`
- `xsd:integer`
- `xsd:positiveInteger`
- `xsd:nonPositiveInteger`
- `xsd:negativeInteger`
- `xsd:long`
- `xsd:int`
- `xsd:short`
- `xsd:byte`
- `xsd:nonNegativeInteger`
- `xsd:unsignedLong`
- `xsd:unsignedInt`
- `xsd:unsignedShort`
- `xsd:unsignedByte`

#### Temporal

- `rex:sort rex:earliest`
- `rex:sort rex:latest`

Valid for datatypes:

- `xsd:date`
- `xsd:dateTime`

#### Boolean

- `rex:sort rex:all`
- `rex:sort rex:any`

Valid for datatypes:

- `xsd:boolean`
