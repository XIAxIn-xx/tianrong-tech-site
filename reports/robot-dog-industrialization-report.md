# 天戎科技机器狗工业化优化报告

生成时间：2026-08-03T04:03:42.736986+00:00

## 源模型与执行环境

- 源模型：`public/models/source/robot-dog-4k.fbx`
- 新建导入副本：`artifacts/robot-dog-industrial/source-imported.blend`
- Blender：`4.5.11 LTS`
- Blender 执行路径：`/Applications/Blender.app/Contents/MacOS/Blender`
- 原始文件未覆盖；备份清单：`reports/robot-dog-backup-manifest.json`

## 审计结论

- 主机身：`SPOT_BODY`，源网格 9,417 顶点 / 26,896 边 / 17,506 面。
- 原始腿对象：`FRONT_LEG`、`REAR_R_LEG`；源场景有 2 个 Armature、4 组动作，动作帧范围为 1–190。
- 原始场景没有 Mirror、Solidify、Subdivision Surface、Bevel 修改器；有 1,274 / 196 / 192 条开放边，未检出过连接非流形边。
- 源 FBX 材质未正确分配到三类模型网格，因此本次重新建立并实际分配工业材质。

## 实际改造

本次只对 `SPOT_BODY`、两条源腿及新增 `TR_` 对象进行处理。原始网格未做破坏性重拓扑。

- industrial_material_set：["Shell_WarmGray", "Frame_Graphite", "Joint_BlastedMetal", "Rubber_Black", "Sensor_DarkGlass", "Accent_BrandBlue"]
- Shell_WarmGray
- Frame_Graphite
- Frame_Graphite
- 添加 X 轴 Mirror 以恢复对称腿，不修改原网格顶点。
- 添加 X 轴 Mirror 以恢复对称腿，不修改原网格顶点。
- Frame_Graphite
- Frame_Graphite
- Frame_Graphite
- Frame_Graphite
- Frame_Graphite
- Shell_WarmGray
- Frame_Graphite
- Joint_BlastedMetal
- Joint_BlastedMetal
- Joint_BlastedMetal
- Joint_BlastedMetal
- Sensor_DarkGlass
- Sensor_DarkGlass
- Accent_BrandBlue
- Frame_Graphite
- Frame_Graphite
- Frame_Graphite
- Frame_Graphite
- Frame_Graphite
- Frame_Graphite
- Frame_Graphite
- Frame_Graphite
- Frame_Graphite
- Joint_BlastedMetal
- Joint_BlastedMetal
- Joint_BlastedMetal
- Frame_Graphite
- Joint_BlastedMetal
- Joint_BlastedMetal
- Joint_BlastedMetal
- Frame_Graphite
- Joint_BlastedMetal
- Joint_BlastedMetal
- Joint_BlastedMetal
- Frame_Graphite
- Joint_BlastedMetal
- Joint_BlastedMetal
- Joint_BlastedMetal
- Frame_Graphite
- Shell_WarmGray
- Joint_BlastedMetal
- Joint_BlastedMetal
- Joint_BlastedMetal
- Joint_BlastedMetal
- Frame_Graphite
- Frame_Graphite
- 增加下方承重框架、上盖、检修板、传感器窗口、接口、散热片、髋部安装座和克制的载荷平台；全部为外部新增对象。
- Frame_Graphite
- Joint_BlastedMetal
- Frame_Graphite
- Joint_BlastedMetal
- Frame_Graphite
- Joint_BlastedMetal
- Rubber_Black
- REAR_R_LEG：{"armature": "Armature", "bones_bound": ["Joint_1_2", "Joint_2_2", "Joint_3_2"], "binding": "new objects parented to original bones; original rig untouched"}
- Frame_Graphite
- Joint_BlastedMetal
- Frame_Graphite
- Joint_BlastedMetal
- Frame_Graphite
- Joint_BlastedMetal
- Rubber_Black
- FRONT_LEG：{"armature": "Armature.001", "bones_bound": ["Joint_2_4", "Joint_3_4", "Joint_4"], "binding": "new objects parented to original bones; original rig untouched"}
- TR_Preview_NeutralGround

新增部件全部带 `TR_Industrial_Generated` 标记，可重复运行时只清理并重建这些部件。腿部外罩与关节护罩绑定到原始骨骼；对角腿的补全使用非破坏性 Mirror，未改变原始骨骼原点。

## 材质

- `Shell_WarmGray`：暖灰白喷涂外壳，高粗糙度。
- `Frame_Graphite`：深灰承重框架与安装件。
- `Joint_BlastedMetal`：低反射喷砂金属关节。
- `Rubber_Black`：脚端与耐磨结构。
- `Sensor_DarkGlass`：深色传感器/接口窗口，无发光。
- `Accent_BrandBlue`：小面积品牌识别件，无灯带、无发光。

## 预览与输出

- [front-3q.png](/Users/edy/Desktop/tianrong-tech-site/artifacts/robot-dog-industrial/previews/front-3q.png)
- [side.png](/Users/edy/Desktop/tianrong-tech-site/artifacts/robot-dog-industrial/previews/side.png)
- [rear-3q.png](/Users/edy/Desktop/tianrong-tech-site/artifacts/robot-dog-industrial/previews/rear-3q.png)
- [top-detail.png](/Users/edy/Desktop/tianrong-tech-site/artifacts/robot-dog-industrial/previews/top-detail.png)
- [contact-sheet.png](/Users/edy/Desktop/tianrong-tech-site/artifacts/robot-dog-industrial/previews/contact-sheet.png)
- 中间 Blend：`artifacts/robot-dog-industrial/tianrong-robot-dog-industrial-v1.blend`
- 最终 Blend：`artifacts/robot-dog-industrial/tianrong-robot-dog-industrial-final.blend`
- 最终 GLB：`public/models/tianrong-robot-dog-industrial.glb`

## GLB 验证

- 旧官网 GLB 大小：`2070068 bytes`
- 新 GLB 大小：`2460644 bytes`
- 重新导入状态：`passed`
- 重新导入对象数：`88`；网格：`79`；Armature：`2`。
- 动画动作：`["Armature.001|CINEMA_4D_Main|Layer0", "Armature.001|CINEMA_4D_Main|Layer0.001", "Armature|CINEMA_4D_Main|Layer0", "Armature|CINEMA_4D_Main|Layer0.001", "OctaneCamera|CINEMA_4D_Main|Layer0", "SPOT_BODY|CINEMA_4D_Main|Layer0", "SPOT_BODY|CINEMA_4D_Main|Layer0.001"]`
- 材质齐全：`True`；导出 GLB 不含摄影棚相机和灯光：`True`。

## 官网集成与测试

- 官网组件已使用 `/models/tianrong-robot-dog-industrial.glb`；旧路径保留为 `LEGACY_MODEL_PATH`，便于恢复。
- 官网文件：`components/hero/hero-robot-preview.tsx`、`next.config.mjs`。
- `pnpm typecheck`：通过。
- `pnpm build`：通过；Next.js 14.2.23 编译并生成 8 个静态页面。
- `GET /models/tianrong-robot-dog-industrial.glb`：`200 OK`；`Content-Type: model/gltf-binary`；`Content-Length: 2460644`；长期缓存头生效。
- 桌面浏览器检查：进入机器人展示区后 WebGL 画布成功渲染工业化模型；控制台无模型加载错误，仅有 Three.js `THREE.Clock` 弃用 warning。
- 移动端 `390×844` 检查：`bodyScrollWidth=390`、`htmlScrollWidth=390`，无横向溢出；按现有性能策略使用静态预览，不在移动端自动加载 GLB。
- 浏览器视觉检查：桌面首屏、机器人展示区和移动端首屏均完成；未发现模型容器导致的页面横向裁切或溢出。

## 恢复方式与风险

- 恢复旧模型：将 `LEGACY_MODEL_PATH` 改回 `/models/tianrong-robot-dog.v1.glb`，或从 `backups/robot-dog-industrial/` 对应时间戳恢复前端和模型文件。
- 源网格开放边保留，未进行自动封口，避免破坏骨骼/层级；新增结构件为外部件。
- 源 FBX 只有两个腿网格和两个腿 Armature；Mirror 补全的对侧结构属于静态休止姿态，原始两条腿的动作数据保留。该边界已写入验证结果，需以后在真实步态预览中继续确认。
