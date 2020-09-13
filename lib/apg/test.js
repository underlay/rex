import { Store, NamedNode, BlankNode, Literal, IRIs, DataFactory, Parse, } from "n3.ts";
import Either from "fp-ts/lib/Either.js";
import { parse, parseSchema } from "./shex.js";
import fs from "fs";
function testTestSchema() {
    const rex = "http://underlay.org/ns/rex";
    const p = (base, id) => `${base}#${id}`;
    const subject = new NamedNode(p(rex, "subject")), object = new NamedNode(p(rex, "object")), lat = new NamedNode(p(rex, "lat")), long = new NamedNode(p(rex, "long"));
    const personType = new NamedNode("http://example.com/Person"), knowsType = new NamedNode("http://example.com/Person/knows"), nameType = new NamedNode("http://example.com/Person/name"), geoType = new NamedNode("http://example.com/Person/geo");
    const decimal = new NamedNode(IRIs.xsd.decimal);
    const rdfType = new NamedNode(IRIs.rdf.type);
    const pg = new BlankNode("person-geo"), g1 = new BlankNode("geo1"), g2 = new NamedNode("http://im-a-geo-coordinate.com"), pk = new BlankNode("person-knows"), p1 = new BlankNode("person1"), p2 = new BlankNode("person2"), n1 = new BlankNode("person-name1"), n2 = new BlankNode("person-name2");
    const store = new Store([
        DataFactory.quad(p1, rdfType, personType),
        DataFactory.quad(p2, rdfType, personType),
        DataFactory.quad(n1, rdfType, nameType),
        DataFactory.quad(n1, subject, p1),
        DataFactory.quad(n1, object, new Literal("John Doe", null)),
        DataFactory.quad(n2, rdfType, nameType),
        DataFactory.quad(n2, subject, p2),
        DataFactory.quad(n2, object, new Literal("Jane Doe", null)),
        DataFactory.quad(pk, rdfType, knowsType),
        DataFactory.quad(pk, subject, p1),
        DataFactory.quad(pk, object, p2),
        DataFactory.quad(pg, rdfType, geoType),
        DataFactory.quad(pg, subject, p1),
        DataFactory.quad(pg, object, g2),
    ]);
    const schema = JSON.parse(fs.readFileSync("src/v3/test.schema.json", "utf-8"));
    for (const [label, values] of parse(store, schema["@graph"])) {
        for (const [id, value] of values) {
            if (Either.isLeft(value)) {
                console.error(value.left.errors);
                process.exit(1);
            }
            else {
                console.log(label, id, value.right);
            }
        }
    }
}
function testSchemaSchema() {
    const input = fs.readFileSync("src/v3/test.schema.nq", "utf-8");
    const store = new Store(Parse(input));
    const schema = JSON.parse(fs.readFileSync("src/v3/schema.schema.json", "utf-8"));
    for (const [label, values] of parse(store, schema["@graph"])) {
        for (const [id, value] of values) {
            if (Either.isLeft(value)) {
                console.error(value.left.errors);
                process.exit(1);
            }
            else {
                console.log(label, id, value.right);
            }
        }
    }
}
function schemaSchemaSchema() {
    const input = fs.readFileSync("src/v3/schema.schema.nq", "utf-8");
    const store = new Store(Parse(input));
    const schema = JSON.parse(fs.readFileSync("src/v3/schema.schema.json", "utf-8"));
    for (const [label, values] of parse(store, schema["@graph"])) {
        for (const [id, value] of values) {
            if (Either.isLeft(value)) {
                console.error(value.left.errors);
                process.exit(1);
            }
            else {
                console.log(label, id, value.right);
            }
        }
    }
}
function parseSchemaSchema() {
    const input = fs.readFileSync("src/v3/schema.schema.nq", "utf-8");
    const store = new Store(Parse(input));
    const schema = JSON.parse(fs.readFileSync("src/v3/schema.schema.json", "utf-8"));
    const result = parseSchema(store, schema["@graph"]);
    console.log(JSON.stringify(result));
    // for (const [label, values] of parse(store, schema["@graph"])) {
    // 	for (const [id, value] of values) {
    // 		if (Either.isLeft(value)) {
    // 			console.error(value.left.errors)
    // 			process.exit(1)
    // 		} else {
    // 			console.log(label, id, value.right)
    // 		}
    // 	}
    // }
}
// testTestSchema()
// testSchemaSchema()
// schemaSchemaSchema()
parseSchemaSchema();
//# sourceMappingURL=test.js.map