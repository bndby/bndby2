const wasBurn = new Date( 1981, 10, 16, 19, 55, 0, 0 )
const now = new Date
const age = new Date( Math.abs( now - wasBurn ) )

const Age = () => (
	<span>{ age.getDate() - 1 }.{ age.getMonth() < 10 ? '0' : '' }{ age.getMonth() }.{ age.toISOString().slice(0, 4) - 1970 } { age.getHours() }:{ age.getMinutes() }</span>
)

export default Age