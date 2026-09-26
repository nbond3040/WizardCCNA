import type { Diagram as DiagramSpec } from '../../content/types';
import { Topology } from './Topology';
import { Sequence } from './Sequence';
import { Header } from './Header';
import { Stack } from './Stack';
import { Bits } from './Bits';
import { Flow } from './Flow';
import './diagram.css';

export function Diagram({ d, compact }: { d: DiagramSpec; compact?: boolean }) {
  let body;
  switch (d.type) {
    case 'topology':
      body = <Topology d={d} maxUnit={compact ? 70 : 96} />;
      break;
    case 'sequence':
      body = <Sequence d={d} />;
      break;
    case 'header':
      body = <Header d={d} />;
      break;
    case 'stack':
      body = <Stack d={d} />;
      break;
    case 'bits':
      body = <Bits d={d} />;
      break;
    case 'flow':
      body = <Flow d={d} />;
      break;
    default:
      body = <div className="muted small">Unsupported diagram</div>;
  }
  return <div className={`diagram ${compact ? 'compact' : ''}`}>{body}</div>;
}
