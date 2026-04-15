# FIFA World Cup Group Video Template

This project is a Remotion template for rendering FIFA World Cup group videos from `public/master.json`.

Each render is driven by two props:

- `groupId`: one of `group_a` through `group_l`
- `format`: `"landscape"` or `"vertical"`

Every video includes:

1. a group title scene
2. four team spotlight scenes
3. a final overview scene with all teams and the full fixture list

## Assets

- `public/master.json`: source data for groups, teams, rankings, coaches, and fixtures
- `public/flags/*.svg`: flag assets referenced by the JSON

## Commands

Install dependencies:

```console
npm i
```

Start Remotion Studio:

```console
npm run dev
```

Run checks:

```console
npm run lint
```

Bundle the project:

```console
npm run build
```

Render every group in both formats:

```console
npm run render:all
```

## Compositions

- `WorldCupGroupTemplate`: general-purpose render entrypoint
- `WorldCupGroupLandscape`: landscape preview preset
- `WorldCupGroupVertical`: vertical preview preset

## Rendering

Render a landscape group video:

```console
npx remotion render WorldCupGroupTemplate out/group-a-landscape.mp4 --props='{"groupId":"group_a","format":"landscape"}'
```

Render a vertical group video:

```console
npx remotion render WorldCupGroupTemplate out/group-b-vertical.mp4 --props='{"groupId":"group_b","format":"vertical"}'
```

Batch renders are written to:

- `renders/landscape/group-a.mp4` through `group-l.mp4`
- `renders/portrait/group-a.mp4` through `group-l.mp4`
