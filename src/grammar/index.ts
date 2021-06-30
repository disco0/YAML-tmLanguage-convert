/**
 * @TODO In the interest of encapsulating the transformation/input/watching elements of this I ended
 *       up merging everything that was supposed to be in this submodule into a single namespace in
 *       {@link import('./tm') tm}—break back up now that its been encapsulated.
 */

import { processGrammar } from './tm'

export { processGrammar }
export default { processGrammar }