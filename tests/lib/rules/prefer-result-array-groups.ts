import { RuleTester } from "eslint"
import path from "path"
import rule from "../../../lib/rules/prefer-result-array-groups"

const tester = new RuleTester({
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
    },
})

tester.run("prefer-result-array-groups", rule as any, {
    valid: [
        `
        const regex = /regexp/
        let match
        while (match = regex.exec(foo)) {
            const match = match[0]
            // ...
        }
        `,
        `
        const regex = /a(b)c/
        let match
        while (match = regex.exec(foo)) {
            const p1 = match[1]
            // ...
        }
        `,
        `
        const regex = /a(b)c/
        let match
        while (match = regex.exec(foo)) {
            const p1 = match?.[1]
            // ...
        }
        `,
        `
        const regex = /a(b)c/
        let match
        while (match = regex.exec(foo)) {
            const p1 = match.unknown
            // ...
        }
        `,
        `
        const regex = /a(?<foo>b)c/
        let match
        while (match = regex.exec(foo)) {
            const p1 = match.unknown
            // ...
        }
        `,
        // String.prototype.match()
        `
        const arr = "str".match(/regexp/)
        const p1 = arr[1]
        `,
        `
        const arr = "str".match(/a(b)c/)
        const p1 = arr[1]
        `,
        `
        const arr = "str".match(/a(?<foo>b)c/)
        const p1 = arr.groups.foo
        `,
        `
        const arr = "str".match(/a(?<foo>b)c/)
        const p1 = arr.unknown
        `,
        `
        const arr = unknown.match(/a(?<foo>b)c/)
        const p1 = arr[1]
        `,
        `
        const arr = "str".match(/a(?<foo>b)c/g)
        const p1 = arr[1]
        `,
        // String.prototype.matchAll()
        `
        const matches = "str".matchAll(/a(?<foo>b)c/);
        for (const match of matches) {
            const p1 = match.groups.foo
            // ..
        }
        `,
        `
        const matches = "str".matchAll(/a(b)c/);
        for (const match of matches) {
            const p1 = match[1]
            // ..
        }
        `,
        `
        const matches = unknown.matchAll(/a(?<foo>b)c/);
        for (const match of matches) {
            const p1 = match.groups.foo
            // ..
        }
        `,
    ],
    invalid: [
        {
            code: `
            const regex = /a(?<foo>b)c/
            let match
            while (match = regex.exec(foo)) {
                const p1 = match[1]
                // ...
            }
            `,
            output: `
            const regex = /a(?<foo>b)c/
            let match
            while (match = regex.exec(foo)) {
                const p1 = match.groups.foo
                // ...
            }
            `,
            errors: [
                {
                    message:
                        "Unexpected indexed access for the named capturing group 'foo' from regexp result array.",
                    line: 5,
                    column: 28,
                },
            ],
        },
        {
            code: `
            const regex = /a(?<foo>b)c/
            let match
            while (match = regex.exec(foo)) {
                const p1 = match?.[1]
                // ...
            }
            `,
            output: `
            const regex = /a(?<foo>b)c/
            let match
            while (match = regex.exec(foo)) {
                const p1 = match?.groups.foo
                // ...
            }
            `,
            errors: [
                {
                    message:
                        "Unexpected indexed access for the named capturing group 'foo' from regexp result array.",
                    line: 5,
                    column: 28,
                },
            ],
        },
        {
            code: `
            const regex = /a(?<foo>b)c/
            let match
            while (match = regex.exec(foo)) {
                const p1 = match?.[(1)]
                // ...
            }
            `,
            output: `
            const regex = /a(?<foo>b)c/
            let match
            while (match = regex.exec(foo)) {
                const p1 = match?.groups.foo
                // ...
            }
            `,
            errors: [
                {
                    message:
                        "Unexpected indexed access for the named capturing group 'foo' from regexp result array.",
                    line: 5,
                    column: 28,
                },
            ],
        },
        {
            code: `
            const regex = /(a)(?<foo>b)c/
            let match
            while (match = regex.exec(foo)) {
                const p1 = match[1]
                const p2 = match[2]
                // ...
            }
            `,
            output: `
            const regex = /(a)(?<foo>b)c/
            let match
            while (match = regex.exec(foo)) {
                const p1 = match[1]
                const p2 = match.groups.foo
                // ...
            }
            `,
            errors: [
                {
                    message:
                        "Unexpected indexed access for the named capturing group 'foo' from regexp result array.",
                    line: 6,
                    column: 28,
                },
            ],
        },
        {
            code: `
            const regex = /(?<foo>a)(?<bar>b)c/
            let match
            while (match = regex.exec(foo)) {
                const [,p1,p2] = match
                // ...
            }
            `,
            output: null,
            errors: [
                {
                    message:
                        "Unexpected indexed access for the named capturing group 'foo' from regexp result array.",
                    line: 5,
                    column: 25,
                },
                {
                    message:
                        "Unexpected indexed access for the named capturing group 'bar' from regexp result array.",
                    line: 5,
                    column: 28,
                },
            ],
        },
        // String.prototype.match()
        {
            code: `
            const arr = "str".match(/a(?<foo>b)c/)
            const p1 = arr[1]
            `,
            output: `
            const arr = "str".match(/a(?<foo>b)c/)
            const p1 = arr.groups.foo
            `,
            errors: [
                {
                    message:
                        "Unexpected indexed access for the named capturing group 'foo' from regexp result array.",
                    line: 3,
                    column: 24,
                },
            ],
        },
        {
            code: `
            const arr = unknown.match(/a(?<foo>b)c/)
            const p1 = arr[1]
            `,
            output: `
            const arr = unknown.match(/a(?<foo>b)c/)
            const p1 = arr.groups.foo
            `,
            options: [{ strictTypes: false }],
            errors: [
                {
                    message:
                        "Unexpected indexed access for the named capturing group 'foo' from regexp result array.",
                    line: 3,
                    column: 24,
                },
            ],
        },
        // String.prototype.matchAll()
        {
            code: `
            const matches = "str".matchAll(/a(?<foo>b)c/);
            for (const match of matches) {
                const p1 = match[1]
                // ..
            }
            `,
            output: `
            const matches = "str".matchAll(/a(?<foo>b)c/);
            for (const match of matches) {
                const p1 = match.groups.foo
                // ..
            }
            `,
            errors: [
                {
                    message:
                        "Unexpected indexed access for the named capturing group 'foo' from regexp result array.",
                    line: 4,
                    column: 28,
                },
            ],
        },
        {
            code: `
            const matches = unknown.matchAll(/a(?<foo>b)c/);
            for (const match of matches) {
                const p1 = match[1]
                // ..
            }
            `,
            output: `
            const matches = unknown.matchAll(/a(?<foo>b)c/);
            for (const match of matches) {
                const p1 = match.groups.foo
                // ..
            }
            `,
            options: [{ strictTypes: false }],
            errors: [
                {
                    message:
                        "Unexpected indexed access for the named capturing group 'foo' from regexp result array.",
                    line: 4,
                    column: 28,
                },
            ],
        },
        // with TypeScript
        {
            filename: path.join(__dirname, "prefer-result-array-groups.ts"),
            code: `
            const regex = /a(?<foo>b)c/
            let match
            while (match = regex.exec(foo)) {
                const p1 = match[1]
                // ...
            }
            `,
            output: `
            const regex = /a(?<foo>b)c/
            let match
            while (match = regex.exec(foo)) {
                const p1 = match.groups!.foo
                // ...
            }
            `,
            parser: require.resolve("@typescript-eslint/parser"),
            parserOptions: {
                project: require.resolve("../../../tsconfig.json"),
            },
            errors: [
                "Unexpected indexed access for the named capturing group 'foo' from regexp result array.",
            ],
        },
        {
            // If don't give type information.
            code: `
            const regex = /a(?<foo>b)c/
            let match
            while (match = regex.exec(foo)) {
                const p1 = match[1]
                // ...
            }
            `,
            output: null,
            parser: require.resolve("@typescript-eslint/parser"),
            errors: [
                "Unexpected indexed access for the named capturing group 'foo' from regexp result array.",
            ],
        },
        {
            // Not using RegExpExecArray
            filename: path.join(__dirname, "prefer-result-array-groups.ts"),
            code: `
            const regex = /a(?<foo>b)c/
            let match: any[] | null
            while (match = regex.exec(foo)) {
                const p1 = match[1]
                // ...
            }
            `,
            output: null,
            parser: require.resolve("@typescript-eslint/parser"),
            parserOptions: {
                project: require.resolve("../../../tsconfig.json"),
            },
            errors: [
                "Unexpected indexed access for the named capturing group 'foo' from regexp result array.",
            ],
        },
        {
            // Using `any` type.
            filename: path.join(__dirname, "prefer-result-array-groups.ts"),
            code: `
            const regex = /a(?<foo>b)c/
            let match: any
            while (match = regex.exec(foo)) {
                const p1 = match[1]
                // ...
            }
            `,
            output: `
            const regex = /a(?<foo>b)c/
            let match: any
            while (match = regex.exec(foo)) {
                const p1 = match.groups.foo
                // ...
            }
            `,
            parser: require.resolve("@typescript-eslint/parser"),
            parserOptions: {
                project: require.resolve("../../../tsconfig.json"),
            },
            errors: [
                "Unexpected indexed access for the named capturing group 'foo' from regexp result array.",
            ],
        },
    ],
})
