# rex

> Reduction Expressions

This is an experimental language for annotating [ShEx](https://shex.io) shapes with _reduction expressions_. Reduction expressions let you materialize structured instances from any RDF dataset.

## Table of Contents

- [Schemas](#schemas)
- [Validation vs Materialization](#validation-vs-materialization)
- [Annotations](#annotations)
  - [`rex:sort` annotations](#rexsort-annotations)
    - [Lexicographic orders](#lexicographic-orders)
    - [Numeric orders](#numeric-orders)
    - [Temporal orders](#temporal-orders)
    - [Boolean orders](#boolean-orders)
  - [`rex:in` annotations](#rexin-annotations)
    - [Optimistic instantiation](#optimistic-instantiation)
  - [`rex:key` annotations](#rexkey-annotations)
  - [`rex:with` annotations](#rexwith-annotations)
  - [`rex:meta` annotations](#rexmeta-annotations)


## Schemas

A Rex schema is a set of named shapes, each of which is a set of properties. Each property has a unique (within the shape) predicate, a minimum and maximum cardinality, and a value expression that is either a pure function over IRIs and Literals `(term: RDF.NamedNode | RDF.Literal) => boolean` or a reference to another shape in the same schema.

Rex schemas are expressed using a strict subset of the [ShEx](https://shex.io/) language. The schemas we allow are very similar to [ShEx Lite defined by DCMI](https://dcmi.github.io/dcap/shex_lite/micro-spec.html), with a few differences:

- We require that all shapes have a blank node subject constraint.
- Value expressions cannot be `{ "nodeKind": "bnode" }` or `{ "nodeKind": "nonliteral" }` node constraints; only IRI and Literal values will be tested. There's nothing to stop a user from expressing "this value can be any blank node" by reference an empty shape; we just require that it be given a name and referenced by a [`shapeRef`](http://shex.io/shex-semantics/index.html#prod-shapeRef).
- Conceptually, reduction expressions are defined over arbitrary predicates `(term: RDF.NamedNode | RDF.Literal) => boolean` as value expressions, not just the ones defined in ShEx (other predicates might be expressed with the [Semantic Actions](http://shex.io/shex-semantics/index.html#semantic-actions) extension mechanism).

[src/schema.ts](src/schema.ts) exports an [io-ts](https://github.com/gcanti/io-ts) validator for compliant schemas.

In general, Rex only uses the syntax of ShEx as a convenient way to write node constraints. The semantics, especially with respect to maximum cardinalities, differ considerably.

Here's an example schema consisting of one shape:

```
PREFIX schema: <http://schema.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

# This is a shape whose label is _:person
# The `bnode` keyword is required for all shapes
_:person bnode {
  # `a` is always shorthand for the rdf:type predicate
  a [ schema:Person ] ;

  # zero or one triples with predicate schema:url and an IRI object
  schema:url iri ? ;

  # exactly one triple with predicate schema:name and a literal object
  # with datatype xsd:string
  schema:name xsd:string ;

  # any number of triples with predicates schema:children, whose objects
  # are blank nodes that also validate the _:person shape
  schema:children @_:person * ;
}
```

By default, properties are assumed to have minimum and maximum cardinalities of 1. Other cardinalities are expressed through familiar regular expressions-style syntaxes `?`, `*`, `{2,4}`, etc.

## Validation vs Materialization

ShEx is used for _validating whether a node matches a shape_ in a dataset. We want to use Rex schemas for something slightly different: _materializing instances of each shape_ using a dataset as a source.

This means that instead of

```typescript
function validate(
	node: RDF.Term,
	schema: ShExParser.Schema,
	shape: string,
	dataset: RDF.Quad[]
): Success | Failure {}
```

we have something more like

```typescript
type Table = Map<RDF.BlankNode, { [predicate: string]: RDF.Term[] }>

function materialize(
	schema: Rex.Schema,
	dataset: RDF.Quad[]
): Map<string, Table> {}
```

... where `materialize` returns, for each shape in the schema, a materialized `Table` with a row for each matching blank node subject, and columns for each predicate in the shape.

Materializing instead of validating also means that we treat maximum cardinalities differently. Supposing we had this schema

```
PREFIX ex: <http://example.com/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

_:foo bnode {
  # has either zero, one, or two triples with predicate ex:bar
  # and integer objects
  ex:bar xsd:integer {0,2} ;
}
```

and this dataset:

```
_:b0 <http://example.com/bar> "4"^^<http://www.w3.org/2001/XMLSchema#integer> .
_:b0 <http://example.com/bar> "7"^^<http://www.w3.org/2001/XMLSchema#integer> .
_:b0 <http://example.com/bar> "1"^^<http://www.w3.org/2001/XMLSchema#integer> .
```

Here, the node `_:b0` would **not** validate the ShEx shape `_:foo`, since the data exceeds the maximum allowed cardinality for the `ex:bar` property.

However, if our goal is to materialize instances of `_:foo` from the given dataset, we can achieve this by simply ignoring one of the three values and only "taking" two of them to include in the table. Any of these results

```
Map(_:foo → Map(_:b0 → { ex:bar: [4, 7] }))
Map(_:foo → Map(_:b0 → { ex:bar: [4, 1] }))
Map(_:foo → Map(_:b0 → { ex:bar: [7, 4] }))
```

would work. But how do we decide which two of the three values to include?

## Annotations

Every triple constraint (ie property) of a shape in a Rex schema can be annotated with a heuristic annotation that defines a total order over the terms satisfying its value expression. We express these using [ShEx annotations](http://shex.io/shex-semantics/index.html#annotations), using a syntax like this:

```
PREFIX ex: <http://example.com/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rex: <http://underlay.org/ns/rex#>

_:foo bnode {
  ex:bar xsd:integer {0,2} // rex:sort rex:greatest ;
}
```

Rex annotations are just a pair of URIs `// [property] [value]` that come _before_ the semicolon terminating a triple constraint.

### `rex:sort` annotations

The simplest kind of annotation is one that uses the `rex:sort` property to compare terms based on their lexical forms alone.

#### Lexicographic orders

- `// rex:sort rex:first`
- `// rex:sort rex:last`

The two lexicographic orders compare the lexical forms of terms directly, as byte strings. These are the only two sort annotations that apply to IRIs as well as Literals. For sorting literals, the value of each literal is first compared, if they are equal, then the datatypes are compared.

For example, the schema

```
PREFIX schema: <http://schema.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rex: <http://underlay.org/ns/rex#>

_:thing bnode {
  schema:name xsd:string // rex:sort rex:first ;
}
```

over the dataset

```
_:b0 <http://schema.org/name> "Zachary" .
_:b0 <http://schema.org/name> "Alyssa" .
_:b0 <http://schema.org/name> "22"^^<http://www.w3.org/2001/XMLSchema#integer> .
```

would materialize a single table with a single row with single column `http://schema.org/name` with a single value `"Alyssa"`. Switching the annotation to `rex:last` would select the value `"Zachary"` instead.

#### Numeric orders

- `// rex:sort rex:greatest`
- `// rex:sort rex:least`

The two numeric orders only apply to node constraints that include a fixed datatype constraint that is one of the numeric datatypes defined in [XSD Schema](https://www.w3.org/TR/xmlschema11-2/#built-in-datatypes):

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

In other words, this schema

```
PREFIX schema: <http://schema.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rex: <http://underlay.org/ns/rex#>

_:thing bnode {
  schema:name xsd:string // rex:sort rex:greatest ;
}
```

is **invalid** because `rex:greatest` does not apply to `xsd:string` literals - you can only use numeric orders on triple constraints whose value expression "already" limits the range of matching values to one of the numeric domains.

#### Temporal orders

- `// rex:sort rex:earliest`
- `// rex:sort rex:latest`

Like numeric orders, the two temporal orders only apply to specific fixed datatypes:

- `xsd:date`
- `xsd:dateTime`
- `xsd:dateTimeStamp`

... which themselves are constrained to have valid ISO 8601 dates as values (ShEx and Rex both check this by default).

#### Boolean orders

- `// rex:sort rex:any`
- `// rex:sort rex:all`

Lastly, there are two "boolean orders", which only apply to `xsd:boolean` datatypes. These are more conceptually confusing, but ultimately follow the same logic as the rest of the datatype orders.

Imagine we are given a triple constraint with a `xsd:boolean` value expression, and a set of "many" (at most two) possible distinct values. Which value should we select if we are limited by cardinality?

There are four possible situations:

- the dataset has no values for the property
- the dataset only has `"false"`
- the dataset only has `"true"`
- the dataset has both `"true"` and `"false"`

In the first three cases, there are no decisions to be made: depending on the minimum cardinality, the subject will either match or not match, and the only value will be included if present. However in the last case, if the maximum cardinality is 1, then there is exactly one decision to be made: which value to take? `rex:all` will take `"false"`, and `rex:any` will take `"true"`, corresponding to the logical AND and OR over "all available values", respectively.

### `rex:in` annotations

Rex also has annotations that can be used to further _filter_ the values that can a property can take. The `rex:in` annotation is used to reference another shape in the same schema:

```
PREFIX ex: <http://example.com/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rex: <http://underlay.org/ns/rex#>

ex:Person bnode {
  ex:name xsd:string // rex:in ex:Update ;
}

ex:Update bnode {
  ex:timestamp xsd:dateTime ;
}
```

which restricts matches to the triple constraint to _quads whose graph term validates the referenced shape_.

Consider materializing the schema over this dataset:

```
_:b0 <http://example.com/name> "John" .
_:b1 <http://example.com/name> "Jack" _:b2 .
_:b2 <http://example.com/timestamp> "yesterday" .
_:b3 <http://example.com/name> "Jill" _:b4 .
_:b4 <http://example.com/timestamp> "2020-07-15T18:25:25.896Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
```

Without the `rex:in` annotation, we would materialize three instances of `ex:Person` (`_:b0`, `_:b1`, `_:b3`) and one instance of `ex:Update` (only `_:b4`, since `_:b2` has the wrong datatype for its only timestamp value). However, the `rex:in` annotation filters out the domain of quads used to satisfy the entire `ex:name xsd:string` constraint to only those quads whose graph terms are blank nodes that validate the `ex:Update` shape. So with the `rex:in` annotation, only `_:b3` gets instantiated as an `ex:Person`.

#### Optimistic instantiation

You might suspect that there is some ambiguity hiding in here. For example, given this schema

```
PREFIX ex: <http://example.com/>
PREFIX rex: <http://underlay.org/ns/rex#>

ex:Foo bnode {
  # square brackets indicate a fixed "value set" node constraint
  ex:bar [ "🤨" "🧐" ] // rex:in ex:Foo ;
}
```

and the dataset

```
_:b0 <http://example.com/bar> "🧐" _:b0 .
```

there are actually two self-consistent conclusions:

- `_:b0` instantiates `ex:Foo`
- `_:b0` does not instantiate `ex:Foo`

To eliminate this ambiguity, and to generally be more friendly, we say that instantiation is _optimistic_ (ie that the first conclusion is correct). Practically, this means that instantiation is done in two passes: first by ignoring shape references and `rex:in` constraints to instantiate a set of "optimistic" tables, and then going back, removing values whose references don't exist, and propagating those deletions around to the appropriate places.

Ambiguity around recursive shape references is handled the same way. Given the schema

```
PREFIX ex: <http://example.com/>

ex:Foo bnode {
  ex:bar @ex:Foo ;
}
```

over the dataset

```
_:b0 <http://example.com/bar> _:b0 .
```

both "`_:b0` validates `ex:Foo`" and "`_:b0` does not validate `ex:Foo`" are self-consistent conclusions, but we define the "optimistic" one to be correct.

### `rex:key` annotations

> Never use IRIs as subjects

Rex promotes an unorthodox perspective on RDF data modeling, which is basically summarized by the prescription/assumption/ethos "Never use IRIs as subjects". This is why all Rex shapes are required to have a `{ "nodeKind": "bnode" }` subject constraint, and why node constraints can only match IRIs or Literals (or be explicit shape references).

This "blank node maximalist" philosophy was motivated by a perceived failure of IRIs to actually identify coherent abstract resources in practice. Instead of using IRIs as "absolute" subjects, Rex encourages publishers to encode all of their resources using blank nodes, and move what would be an IRI subject to the object of some distinguished identifier property.

Blank node maximalism undermines what is commonly seen as the core _purpose_ of RDF - that merging two separate datasets yields a semanticly meaningful union, because IRIs have global scope and can be trivially "joined". Blank node maximalism is also concerned with the merging of separate datasets, but takes a different approach: mergining is done by taking the union dataset and then inducing an equivalence relation over the blank nodes. This essentially **defers reconciliation from publication-time** (ie careful selection of absolute IRI subjects) **to consumption-time** (application of an equivalence relation).

In the most common case, where IRIs that would otherwise have been used as a subject are moved to a distinguished identifier property, the desired equivalence relation will resemble a primary key as used in joining relational data. This simplest kind of equivlance relation can be expressed in Rex using the `rex:key` annotation:

```
PREFIX schema: <http://schema.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rex: <http://underlay.org/ns/rex#>

_:person bnode {
  a [ schema:Person ] ;
  schema:url iri ;
  schema:name xsd:string ;
  schema:children @_:person * ;
} // rex:key schema:url
```

Here, `// rex:key schema:url` annotates the _shape_, and it means "before trying to instantiate the `_:person` shape, first merge all the blank nodes that have the same `schema:url` value".

Let's try materializing this schema over the dataset

```
_:b0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Person> .
_:b0 <http://schema.org/children> _:b1 .
_:b0 <http://schema.org/name> "JOHN D" .
_:b0 <http://schema.org/url> <http://example.com/john-doe> .
_:b1 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Person> .
_:b1 <http://schema.org/age> "11"^^<http://www.w3.org/2001/XMLSchema#integer> .
_:b1 <http://schema.org/name> "Jack" .
_:b1 <http://schema.org/url> <http://example.com/jack> .
_:b2 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Person> .
_:b2 <http://schema.org/age> "30"^^<http://www.w3.org/2001/XMLSchema#integer> .
_:b2 <http://schema.org/name> "John Doe" .
_:b2 <http://schema.org/url> <http://example.com/john-doe> .
_:b2 <http://schema.org/children> _:b3 .
_:b3 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Person> .
_:b3 <http://schema.org/age> "15"^^<http://www.w3.org/2001/XMLSchema#integer> .
_:b3 <http://schema.org/name> "Jill" .
_:b3 <http://schema.org/url> <http://example.com/jill> .
```

This dataset is easier to look at graphically. Here, rounded rectangles represent distinct blank nodes, and the hard rectangles with black text are IRIs:

<p align="center">
  <img src="https://github.com/underlay/rex/blob/master/examples/Screenshot_2020-07-15%20rex(1).png" width="912">
</p>

Since nodes `_:b0` ("JOHN D") and `_:b2` ("John Doe") have the same `schema:url`, they're merged in an intermediate dataset before the shape is instantiated. This means that a (new) single blank node has all of the following triples:

```
_:p0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Person> .
_:p0 <http://schema.org/url> <http://example.com/john-doe> .
_:p0 <http://schema.org/name> "JOHN D" .
_:p0 <http://schema.org/name> "John Doe" .
_:p0 <http://schema.org/children> _:b1 .
_:p0 <http://schema.org/children> _:b3 .
```

Now we have a surplus of `schema:name` values! Since we didn't specify a sort order for the `schema:name` property, Rex falls back to its default order, `rex:first`. `"JOHN D"` lexicographically preceeds `"John Doe"`, so it's `"JOHN D"` that shows up in the final materialized instance:

<p align="center">
  <img src="https://github.com/underlay/rex/blob/master/examples/Screenshot_2020-07-15%20rex(2).png" width="800">
</p>

`rex:key` expressions annotate shapes in the schema - not triple constraints - but they don't actually relate or apply to the shape itself at all. Before instantiating, Rex just collects all the keys that are defined for any of the shapes and (without even looking at what the shapes are) merges all the blank nodes that have the same objects for those predicates. This is confusing, and sometimes leads to unexpected behaviour (like unrelated, nonconforming blank nodes getting "accidentally" merged), so this is likely to change in the future as we figure out more a natural way to induce useful equivalence relations.

Typically the triple constraint that serves as a primary key will have a cardinality of `{1,1}` (which is the default if none is specified) and won't have any sort annotations, since we expect it to only have one value.

### `rex:with` annotations

`rex:with` annotates a triple constraint and takes as a value a different predicate in the same shape. It must be used with an additional `rex:sort` annotation, like this:

```
PREFIX schema: <http://schema.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rex: <http://underlay.org/ns/rex#>

_:article bnode {
  a [ schema:Article ] ;
  schema:headline xsd:string // rex:with schema:dateModified // rex:sort rex:latest ;
  schema:datePublished xsd:dateTime // rex:sort rex:earliest ;
  schema:dateModified xsd:dateTime // rex:sort rex:latest ;
  schema:url iri ;
} // rex:key schema:url
```

Notice that we can have two annotations on the same line! Both come before the terminating `;`. Sometimes it's easier to write them on their own line:

```
schema:headline xsd:string
  // rex:with schema:dateModified
  // rex:sort rex:latest ;
```

But what kind of situation are we working with here? What is this supposed to accomplish? Suppose that we had a series of RDF datasets that looked like this:

```
_:b0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Article> .
_:b0 <http://schema.org/headline> "Bakr Sale Happening at Community Center TOday" .
_:b0 <http://schema.org/datePublished> "2020-07-16T16:46:25.152Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
_:b0 <http://schema.org/dateModified> "2020-07-16T16:46:25.152Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
_:b0 <http://schema.org/url> <http://local-news.com/2020/07/16/bake-sale>
```

```
_:b0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Article> .
_:b0 <http://schema.org/headline> "Bake Sale at Community Center Today" .
_:b0 <http://schema.org/dateModified> "2020-07-16T16:47:47.106Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
_:b0 <http://schema.org/url> <http://local-news.com/2020/07/16/bake-sale>
```

```
_:b0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Article> .
_:b0 <http://schema.org/headline> "Community Center Bake Sale Today" .
_:b0 <http://schema.org/dateModified> "2020-07-16T16:49:32.366Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
_:b0 <http://schema.org/url> <http://local-news.com/2020/07/16/bake-sale>
```

Maybe this is a series of versions of the same dataset, edited a couple times, or maybe it's three independent sources trying to publish similar data about the same article. We could take their direct union (not merging any blank nodes) to get a dataset like this:

<p align="center">
  <img src="https://github.com/underlay/rex/blob/master/examples/Screenshot_2020-07-16%20rex(2).png" width="800">
</p>

Let's call this initial, un-merged union dataset the _preimage_.

Now it's natural to expect that in the merged, instantiated table, we would want to include the most recent value for `schema:lastModified`. And we know how to do this using `// rex:sort rex:latest`! But we also probably want to include the "most recent" value for `schema:headline`, and that doesn't depend on the actual `xsd:string` objects at all. How do we express "take the headline from the blank node with the most recent timestamp"?

This is what `rex:with` is for. When we add `// rex:with schema:lastModified // rex:sort rex:latest`, we're saying two things:

1. Filter the values of `schema:headline` to only keep the ones that _co-occur with at least one `schema:lastModified` value in the preimage_. In other words, only keep the `schema:headline` values that come from a pre-merge blank node that also has one or more `schema:lastModified` values.
2. When sorting the filtered values for `schema:headline`, prefer the ones that are associated with the later `schema:lastModified` values. This is a little tricky because a) any one value for `schema:headline` might actually be associated with multiple different preimage blank nodes, and b) each of those pre-image blank nodes might have multiple `schema:lastModified` values (neither of these are the case in our example, but they could occur in general). Practically, this means populating an "association map" from unique `schema:headline` values to _sets_ of `schema:lastModified` values, then sorting each set to find its "best" (in this case latest) candidate, and then sorting `schema:headline` values by comparing their respective latest candidates.

Putting it all together, we instantiate exactly the result we expect:

<p align="center">
  <img src="https://github.com/underlay/rex/blob/master/examples/Screenshot_2020-07-16%20rex(1).png" width="800">
</p>

There are a few important things to note about this example:

- The sort order that's given with the `rex:with` annotation must apply to the _referenced_ triple constraint, _not_ to the values you're using `rex:with` to sort. In our example, this means that `rex:latest` must match the type of `schema:lastModified` (`xsd:dateTime`), not `schema:headline` (`xsd:string`). Which it does!
- You have to give an explicit `rex:sort` annotation alongside `rex:with`, even if the referenced triple constraint already has the same `rex:sort` annotation on it. This often ends up being a little redundant, but it makes it more clear that the two sorting operations are done independently.
- In the example, only one of the three preimage blank nodes has a `schema:datePublished` property, all three of the preimage blank nodes have a `schema:dateModified` property, but the reduced result has exactly one of each (as required by the schema definition). `rex:with` is very useful for "accumulating" values over graphs that have partial data in this way.
- The three datasets themselves don't have timestamps associated with them, and they're not ordered. Everything that we're dealing with uses the triples in the graphs directly. Rex doesn't really know or care about the names and semantics, it just cares about total orders and equivalence relations.

### `rex:meta` annotations

`rex:meta` works just like `rex:with`, except instead of referencing a sibling triple constraint in the same shape, `rex:meta` is used in conjunction with `rex:in` to reference a triple constraint in the shape that `rex:in` references!

Let's look at an expanded version of the example we used to illustrate `rex:in`:

```
PREFIX schema: <http://schema.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rex: <http://underlay.org/ns/rex#>
PREFIX ex: <http://example.com/>

ex:Person bnode {
  schema:url iri ;
  schema:name xsd:string
    # This refers to the `schema:dateModified` constraint *in* the `ex:Update` shape!
    // rex:meta schema:dateModified
    // rex:sort rex:latest
    // rex:in ex:Update ;
} // rex:key schema:url

ex:Update bnode {
  schema:dateModified xsd:dateTime ;
}
```

And suppose we had a couple datasets:

```
_:b0 <http://schema.org/url> <http://example.com/john-doe> _:b1 .
_:b0 <http://schema.org/name> "JOHN D" _:b1 .
_:b1 <http://schema.org/dateModified> "2020-07-16T19:01:23.062Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
```

```
_:b0 <http://schema.org/url> <http://example.com/john-doe> _:b1 .
_:b0 <http://schema.org/name> "John Doe" _:b1 .
_:b1 <http://schema.org/dateModified> "2020-07-16T19:01:23.062Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
```

The data looks similar to the situation we had in the `rex:with` example, but the date we want to sort by is now a property of the _graph term_, not the subject!

As you might expect, `// rex:meta schema:dateModified // rex:sort rex:latest // rex:in ex:Update` lets us sort the `schema:name` values by the `schema:dateModified` of the graph they came from, in this case prefering `"John Doe"` to `"JOHN D"`:

<p align="center">
  <img src="https://github.com/underlay/rex/blob/master/examples/Screenshot_2020-07-16%20rex(3).png" width="600">
</p>

This structure - using graph names as the subject of metadata properties like dates - is actually much more versatile than using `rex:with`, where _the shape itself had to have referenced property_. With `rex:meta`, you can fragment your data (no matter what it looks like) into named graphs, give those named graphs aribtrary metadata, and then use metadata to control which values to prefer for each property independently.

In many ways, `rex:meta` is the single most important piece of functionality that all of Rex is designed to enable. It essentially allows people to use RDF graphs as _transactions_ by _defining application semantics_ using reduction expressions in the Rex schema. Nothing like this is really possible in the RDF world right now - people update Triplestores by directly adding and removing quads, and people share big static snapshots of datasets, but nobody is using declarative schemas to combine and overwrite graphs iwth overlapping partial data. And the best thing about it is that you can't break it - you can throw in a literally arbirary RDF dataset into the union, and in the worst case it just won't contribute anything to the reduced output at all. The entire instantiation operation is well-defined over any pair of a Rex schema and an RDF dataset, and it's guaranteed to extract every matching instance that exists.
